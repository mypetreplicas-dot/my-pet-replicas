'use client';

import { useState } from 'react';
import type { Product, ProductVariant, OptionGroup } from '@/lib/vendure';
import { uploadPetPhotos, getEnabledVariants } from '@/lib/vendure';
import { useCart, getVendureToken } from '@/context/CartContext';

interface ProductConfiguratorProps {
    product: Product;
}

interface PetConfig {
    id: string;
    petName: string;
    selectedOptions: Record<string, string>;
    uploadedFiles: File[];
    preferredPhotoIndex: number | null;
    specialInstructions: string;
    skipImages: boolean;
    isDragging: boolean;
}

export default function ProductConfigurator({ product }: ProductConfiguratorProps) {
    const { addToCart } = useCart();

    // Filter to only enabled variants
    const enabledVariants = getEnabledVariants(product.variants);

    // Filter option groups to only show options that have at least one enabled variant.
    // Hide entire groups that have only one remaining option (no choice to make).
    const optionGroups: OptionGroup[] = (product.optionGroups || [])
        .map(group => ({
            ...group,
            options: group.options.filter(option =>
                enabledVariants.some(variant =>
                    variant.options?.some(vo => vo.group.code === group.code && vo.code === option.code)
                )
            ),
        }))
        .filter(group => group.options.length > 1);

    // Handle case where all variants are disabled
    if (enabledVariants.length === 0) {
        return (
            <div className="p-10 rounded-xl shadow-[0_0_24px_rgba(0,0,0,0.2)] bg-neutral-800/50 text-center">
                <p className="text-neutral-400 text-lg">
                    This product is currently unavailable.
                </p>
                <p className="text-neutral-500 text-sm mt-2">
                    Please check back soon, or <a href="mailto:mypetreplicas@gmail.com" className="text-terra-400 hover:text-terra-300 transition-colors">email me</a> and I&apos;ll let you know when it&apos;s back.
                </p>
            </div>
        );
    }

    // Initialize default selections
    const getDefaultSelections = () => {
        const selections: Record<string, string> = {};
        for (const group of optionGroups) {
            if (group.options.length > 0) {
                selections[group.code] = group.options[0].code;
            }
        }
        return selections;
    };

    // State: array of pets
    const [pets, setPets] = useState<PetConfig[]>([
        {
            id: '1',
            petName: '',
            selectedOptions: getDefaultSelections(),
            uploadedFiles: [],
            preferredPhotoIndex: null,
            specialInstructions: '',
            skipImages: false,
            isDragging: false,
        }
    ]);

    const [isAdding, setIsAdding] = useState(false);
    const [added, setAdded] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [fileErrors, setFileErrors] = useState<Record<string, { message: string; previewUrl?: string }[]>>({});

    // Clear error for a pet when they make changes
    const clearError = (petId: string) => {
        setValidationErrors(prev => {
            const next = { ...prev };
            delete next[petId];
            return next;
        });
    };

    const groupLabels: Record<string, string> = {
        size: 'Select Size',
        base: 'Display Base',
    };

    // Remove a pet
    const handleRemovePet = (petId: string) => {
        if (pets.length > 1) {
            setPets(pets.filter(p => p.id !== petId));
        }
    };

    // Update pet option
    const updatePetOption = (petId: string, groupCode: string, optionCode: string) => {
        setPets(pets.map(pet =>
            pet.id === petId
                ? { ...pet, selectedOptions: { ...pet.selectedOptions, [groupCode]: optionCode } }
                : pet
        ));
        clearError(petId);
    };

    // Update pet field
    const updatePetField = (petId: string, field: keyof PetConfig, value: any) => {
        setPets(prev => prev.map(pet =>
            pet.id === petId ? { ...pet, [field]: value } : pet
        ));
        // Clear validation error when user makes any change
        if (['uploadedFiles', 'preferredPhotoIndex', 'skipImages'].includes(field)) {
            clearError(petId);
        }
    };

    // Find variant for a pet's selections
    // Only match against visible option groups (hidden groups are irrelevant)
    const visibleGroupCodes = optionGroups.map(g => g.code);
    const getVariantForPet = (pet: PetConfig): ProductVariant | undefined => {
        if (optionGroups.length === 0) {
            return enabledVariants[0];
        }
        const visibleSelections = Object.entries(pet.selectedOptions)
            .filter(([groupCode]) => visibleGroupCodes.includes(groupCode));
        return enabledVariants.find((variant) => {
            if (!variant.options) return false;
            return visibleSelections.every(([groupCode, optionCode]) =>
                variant.options!.some((vo) => vo.group.code === groupCode && vo.code === optionCode)
            );
        });
    };

    // Calculate price for a pet with progressive tiering
    // Pet 1: $150 (full), Pet 2: $140 (7% off), Pet 3: $130 (13% off), Pet 4+: $120 (20% off)
    const getPriceForPet = (petIndex: number, variant: ProductVariant | undefined) => {
        if (!variant || typeof variant.price !== 'number' || isNaN(variant.price)) return null;
        const basePrice = variant.price / 100;

        if (petIndex === 0) return basePrice; // Full price
        if (petIndex === 1) return basePrice * 0.93; // 7% off
        if (petIndex === 2) return basePrice * 0.87; // 13% off
        return basePrice * 0.80; // 20% off for pet 4+
    };

    // Get discount percentage for badge
    const getDiscountPercent = (petIndex: number) => {
        if (petIndex === 0) return null;
        if (petIndex === 1) return 7;
        if (petIndex === 2) return 13;
        return 20;
    };

    const handleAddToCart = async () => {
        // Validate all pets. Stop at first error per pet, priority order
        const errors: Record<string, string> = {};
        for (let i = 0; i < pets.length; i++) {
            const pet = pets[i];
            const suffix = pets.length > 1 ? ` for Pet ${i + 1}` : '';

            // 1. Variant must resolve
            const variant = getVariantForPet(pet);
            if (!variant) {
                errors[pet.id] = `Please select all options before continuing${suffix}.`;
                continue;
            }

            // 2. Photos required (unless skipping)
            if (!pet.skipImages && pet.uploadedFiles.length < 3) {
                errors[pet.id] = `Upload at least 3 photos${suffix}, or check "I'll add images later".`;
                continue;
            }

            // 3. Ref photo must be selected (guard against stale index from deleted photos)
            if (!pet.skipImages && pet.uploadedFiles.length > 0) {
                const poseIndex = pet.preferredPhotoIndex;
                if (poseIndex === null || poseIndex >= pet.uploadedFiles.length) {
                    errors[pet.id] = `Tap the ⭐ "Use" button to select a reference photo${suffix}.`;
                    continue;
                }
            }
        }
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }
        setValidationErrors({});

        setIsAdding(true);

        try {
            // Process each pet and add to cart
            for (let i = 0; i < pets.length; i++) {
                const pet = pets[i];
                let assetIds: string[] = [];
                const variant = getVariantForPet(pet)!;



                if (!pet.skipImages && pet.uploadedFiles.length > 0) {
                    setUploadProgress(`Uploading photos for Pet ${i + 1}...`);
                    const token = getVendureToken();
                    const assets = await uploadPetPhotos(pet.uploadedFiles, token);
                    assetIds = assets.map((a) => a.id);
                }

                setUploadProgress(`Adding Pet ${i + 1} to cart...`);
                const isAdditionalPet = i > 0;
                const discountPercent = getDiscountPercent(i);
                const instructionParts: string[] = [];
                // Unique line ID prevents Vendure from merging lines with the same variant
                instructionParts.push(`[Line: ${Date.now()}-${i}]`);
                if (pet.petName.trim()) instructionParts.push(`[Pet name: ${pet.petName.trim()}]`);
                if (isAdditionalPet && discountPercent) instructionParts.push(`[Multi-pet ${discountPercent}% off]`);
                if (pet.skipImages) instructionParts.push('[Photos pending]');
                if (pet.preferredPhotoIndex !== null) {
                    const starredAssetId = assetIds[pet.preferredPhotoIndex] || '';
                    instructionParts.push(`[Reference photo: Photo ${pet.preferredPhotoIndex + 1}]`);
                    if (starredAssetId) instructionParts.push(`[Reference asset: ${starredAssetId}]`);
                }
                if (pet.specialInstructions) instructionParts.push(pet.specialInstructions);

                const result = await addToCart(variant.id, 1, {
                    specialInstructions: instructionParts.length > 0 ? instructionParts.join(' ') : undefined,
                    petPhotos: assetIds.length > 0 ? assetIds : undefined,
                });

                if (!result.success) {
                    setUploadProgress('');
                    setValidationErrors({ _global: result.errorMessage || 'Something went wrong. Please try again.' });
                    setIsAdding(false);
                    return;
                }
            }

            setAdded(true);
            setUploadProgress('');
            setTimeout(() => setAdded(false), 3000);
        } catch (e) {
            console.error('Failed to add to cart:', e);
            setUploadProgress('');
            setValidationErrors({ _global: 'Something went wrong on our end. Please try again, or email me if the issue continues.' });
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div className="space-y-10">
            {pets.map((pet, petIndex) => {
                const variant = getVariantForPet(pet);
                const price = getPriceForPet(petIndex, variant);
                const priceDisplay = price !== null
                    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)
                    : '.';
                const isAdditionalPet = petIndex > 0;

                return (
                    <div
                        key={pet.id}
                        className={`space-y-8 ${petIndex > 0 ? 'pt-12 border-t border-neutral-800' : ''}`}
                    >
                        {/* Pet Header */}
                        {pets.length > 1 && (
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-white">
                                    Pet {petIndex + 1}
                                    {isAdditionalPet && getDiscountPercent(petIndex) && (
                                        <span className="ml-2 text-xs font-semibold text-terra-400 bg-terra-500/10 px-2 py-1 rounded-full">
                                            {getDiscountPercent(petIndex)}% OFF
                                        </span>
                                    )}
                                </h3>
                                {petIndex > 0 && (
                                    <button
                                        onClick={() => handleRemovePet(pet.id)}
                                        className="text-xs text-neutral-500 hover:text-red-400 transition-colors"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Price */}
                        {petIndex === 0 && (
                            <div>
                                <span className="text-4xl font-display font-bold text-white">{priceDisplay}</span>
                                <span className="ml-2 text-sm text-neutral-500">+ tax</span>
                            </div>
                        )}

                        {/* Pet Name */}
                        <div>
                            <label htmlFor={`pet-name-${pet.id}`} className="block text-sm font-medium text-neutral-400 mb-3">
                                Your Pet&apos;s Name
                            </label>
                            <input
                                id={`pet-name-${pet.id}`}
                                type="text"
                                value={pet.petName}
                                onChange={(e) => updatePetField(pet.id, 'petName', e.target.value)}
                                placeholder="e.g. Buddy, Luna, Max..."
                                className="w-full rounded-xl bg-neutral-800/50 px-5 py-4 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-terra-500/40 transition-all"
                            />
                        </div>

                        {/* Option Group Selectors */}
                        {optionGroups.map((group) => (
                            <div key={group.id}>
                                <label className="block text-sm font-medium text-neutral-400 mb-3">
                                    {groupLabels[group.code] || group.name}
                                </label>
                                <div className="flex flex-wrap gap-3">
                                    {group.options.map((option) => {
                                        const isSelected = pet.selectedOptions[group.code] === option.code;
                                        return (
                                            <button
                                                key={option.id}
                                                onClick={() => updatePetOption(pet.id, group.code, option.code)}
                                                className={`px-5 py-3 rounded-lg text-sm font-medium transition-all ${isSelected
                                                    ? 'bg-terra-600 text-white shadow-[0_0_16px_rgba(212,112,62,0.3)]'
                                                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                                                    }`}
                                            >
                                                {option.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        {/* Photo Upload */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-400 mb-4">
                                Upload Photos of Your Pet
                                <span className="text-neutral-600 ml-1">(at least 3)</span>
                            </label>

                            <button
                                type="button"
                                onClick={() => {
                                    const newSkip = !pet.skipImages;
                                    updatePetField(pet.id, 'skipImages', newSkip);
                                    if (newSkip) {
                                        updatePetField(pet.id, 'uploadedFiles', []);
                                        updatePetField(pet.id, 'preferredPhotoIndex', null);
                                    }
                                }}
                                className="flex items-center gap-3 mb-5 group cursor-pointer"
                            >
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${pet.skipImages
                                    ? 'bg-terra-600 border-terra-600'
                                    : 'border-neutral-700 bg-neutral-800/50'
                                    }`}>
                                    {pet.skipImages && (
                                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                                <span className="text-sm text-neutral-300 group-hover:text-white transition-colors">
                                    I'll add images later
                                </span>
                            </button>

                            {!pet.skipImages ? (
                                <>
                                    <div className="grid grid-cols-3 gap-3">
                                        {/* Uploaded photo thumbnails */}
                                        {pet.uploadedFiles.map((file, index) => {
                                            const isPreferred = pet.preferredPhotoIndex === index;
                                            return (
                                                <div key={index} className="aspect-square relative rounded-lg overflow-hidden">
                                                    {/* Photo Thumbnail */}
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={URL.createObjectURL(file)}
                                                        alt={`Pet photo ${index + 1}`}
                                                        className="absolute inset-0 w-full h-full object-cover"
                                                    />

                                                    {/* Preferred badge. Always visible on top-left */}
                                                    {isPreferred && (
                                                        <div className="absolute top-1.5 left-1.5 z-10 bg-terra-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                                                            Ref
                                                        </div>
                                                    )}

                                                    {/* Action buttons. Always visible */}
                                                    <div className="absolute bottom-0 inset-x-0 flex z-10">
                                                        {/* Star / Set as preferred */}
                                                        <button
                                                            type="button"
                                                            onClick={() => updatePetField(pet.id, 'preferredPhotoIndex', index)}
                                                            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-bold tracking-wide uppercase transition-colors ${isPreferred
                                                                ? 'bg-terra-600 text-white'
                                                                : 'bg-black/70 text-neutral-200 hover:bg-terra-600/80 hover:text-white active:bg-terra-600'
                                                                }`}
                                                        >
                                                            <svg className="w-4 h-4" fill={isPreferred ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isPreferred ? 0 : 2} viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                                                            </svg>
                                                            {isPreferred ? 'Ref' : 'Use'}
                                                        </button>

                                                        {/* Remove */}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newFiles = pet.uploadedFiles.filter((_, i) => i !== index);
                                                                updatePetField(pet.id, 'uploadedFiles', newFiles);
                                                                if (pet.preferredPhotoIndex === index) {
                                                                    updatePetField(pet.id, 'preferredPhotoIndex', null);
                                                                } else if (pet.preferredPhotoIndex !== null && pet.preferredPhotoIndex > index) {
                                                                    updatePetField(pet.id, 'preferredPhotoIndex', pet.preferredPhotoIndex - 1);
                                                                }
                                                            }}
                                                            className="flex items-center justify-center px-3.5 py-2.5 bg-black/70 text-red-400 hover:bg-red-500/40 active:bg-red-500/60 transition-colors"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {/* Add more button. Shown if under max (5 photos) */}
                                        {pet.uploadedFiles.length < 5 && (
                                            <div className={`relative rounded-lg overflow-hidden group ${pet.uploadedFiles.length === 0 ? 'col-span-3 aspect-[3/1] sm:col-span-1 sm:aspect-square' : 'aspect-square'}`}>
                                                <input
                                                    type="file"
                                                    id={`pet-photo-${pet.id}-add`}
                                                    accept="image/jpeg,image/png,image/heic,image/heif"
                                                    multiple
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const fileList = e.target.files;
                                                        if (!fileList || fileList.length === 0) return;

                                                        const validTypes = ['image/jpeg', 'image/png', 'image/heic', 'image/heif'];
                                                        const maxSize = 10 * 1024 * 1024;
                                                        const remaining = 5 - pet.uploadedFiles.length;
                                                        const filesToAdd: File[] = [];
                                                        const errors: { message: string; previewUrl?: string }[] = [];

                                                        for (let i = 0; i < Math.min(fileList.length, remaining); i++) {
                                                            const file = fileList[i];
                                                            if (!validTypes.includes(file.type)) {
                                                                errors.push({ message: 'This file is not a JPG or PNG. Please upload a JPEG or PNG file.' });
                                                                continue;
                                                            }
                                                            if (file.size > maxSize) {
                                                                const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
                                                                errors.push({
                                                                    message: `This photo is ${sizeMB}MB (max 10MB). Please reduce the file size and try again.`,
                                                                    previewUrl: URL.createObjectURL(file),
                                                                });
                                                                continue;
                                                            }
                                                            filesToAdd.push(file);
                                                        }
                                                        setFileErrors(prev => errors.length > 0 ? { ...prev, [pet.id]: errors } : (() => { const next = { ...prev }; delete next[pet.id]; return next; })());

                                                        if (filesToAdd.length > 0) {
                                                            const newFiles = [...pet.uploadedFiles, ...filesToAdd];
                                                            updatePetField(pet.id, 'uploadedFiles', newFiles);

                                                            // Auto-select first photo as preferred
                                                            if (pet.preferredPhotoIndex === null) {
                                                                updatePetField(pet.id, 'preferredPhotoIndex', 0);
                                                            }
                                                        }
                                                        e.target.value = '';
                                                    }}
                                                />
                                                <label
                                                    htmlFor={`pet-photo-${pet.id}-add`}
                                                    className="absolute inset-0 hover:shadow-[0_0_16px_rgba(212,112,62,0.15)] hover:bg-terra-500/5 rounded-lg transition-all cursor-pointer flex flex-col items-center justify-center bg-neutral-800/30 shadow-inner gap-1.5"
                                                >
                                                    <svg className="w-8 h-8 text-neutral-600 group-hover:text-terra-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                    </svg>
                                                    <span className="text-[10px] text-neutral-600 group-hover:text-neutral-400 transition-colors font-medium">
                                                        {pet.uploadedFiles.length === 0 ? 'Add Photos' : 'Add More'}
                                                    </span>
                                                </label>
                                            </div>
                                        )}
                                    </div>

                                    {/* Photo counter */}
                                    {pet.uploadedFiles.length > 0 && (
                                        <div className="flex items-center justify-between mt-3">
                                            <p className={`text-xs font-medium ${pet.uploadedFiles.length >= 3 ? 'text-green-400' : 'text-neutral-500'
                                                }`}>
                                                {pet.uploadedFiles.length} of 3 min
                                                {pet.uploadedFiles.length >= 3 && ' ✔'}
                                            </p>
                                            {pet.preferredPhotoIndex !== null ? (
                                                <p className="text-xs text-terra-400 font-medium">
                                                    Ref photo selected ✔
                                                </p>
                                            ) : pet.uploadedFiles.length >= 1 ? (
                                                <p className="text-xs text-amber-400 font-medium">
                                                    Select a reference photo ↑
                                                </p>
                                            ) : null}
                                        </div>
                                    )}

                                    {/* File validation errors (wrong format / too large) */}
                                    {fileErrors[pet.id] && fileErrors[pet.id].length > 0 && (
                                        <div className="mt-3 space-y-2">
                                            {fileErrors[pet.id].map((err, idx) => (
                                                <div key={idx} className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                                    {err.previewUrl && (
                                                        /* eslint-disable-next-line @next/next/no-img-element */
                                                        <img
                                                            src={err.previewUrl}
                                                            alt="Rejected photo"
                                                            className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                                                        />
                                                    )}
                                                    <p className="text-xs text-red-300 leading-relaxed">
                                                        {err.message}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex items-center gap-4 p-5 bg-terra-500/10 shadow-[0_0_12px_rgba(212,112,62,0.15)] rounded-xl">
                                    <div className="flex-shrink-0 w-8 h-8 bg-terra-600/20 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-terra-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <p className="text-sm text-neutral-300">
                                        Got it. I&apos;ll email you right after checkout so you can send photos then.
                                    </p>
                                </div>
                            )}

                            {/* Inline validation error */}
                            {validationErrors[pet.id] && (
                                <div className="mt-4 flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                    <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                    </svg>
                                    <p className="text-sm text-red-300">{validationErrors[pet.id]}</p>
                                </div>
                            )}
                        </div>

                        {/* Special Instructions */}
                        <div>
                            <label htmlFor={`special-instructions-${pet.id}`} className="block text-sm font-medium text-neutral-400 mb-3">
                                Special Instructions
                                <span className="text-neutral-600 ml-1">(optional)</span>
                            </label>
                            <textarea
                                id={`special-instructions-${pet.id}`}
                                rows={3}
                                value={pet.specialInstructions}
                                onChange={(e) => updatePetField(pet.id, 'specialInstructions', e.target.value)}
                                placeholder="Specific markings, pose, nameplate text, whatever you want me to know..."
                                className="w-full rounded-xl bg-neutral-800/50 px-5 py-4 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-terra-500/40 resize-none transition-all"
                            />
                        </div>

                    </div>
                );
            })}

            {/* Global error */}
            {validationErrors._global && (
                <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    <p className="text-sm text-red-300">{validationErrors._global}</p>
                </div>
            )}

            {/* CTA: "Create My Pet Replica" */}
            <div className="pt-4">
                <button
                    onClick={handleAddToCart}
                    disabled={isAdding}
                    className={`w-full py-4 px-8 min-h-[48px] rounded-full text-lg font-semibold transition-all ${added
                        ? 'bg-terra-700 text-white'
                        : 'bg-terra-600 hover:bg-terra-500 text-white shadow-[0_0_32px_rgba(212,112,62,0.3)] hover:shadow-[0_0_48px_rgba(212,112,62,0.5)]'
                        } disabled:opacity-70 disabled:cursor-not-allowed`}
                >
                    {isAdding ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            {uploadProgress || 'Processing…'}
                        </span>
                    ) : added ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Added to Cart
                        </span>
                    ) : (
                        'Commission My Replica →'
                    )}
                </button>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap gap-x-8 gap-y-3 text-xs text-neutral-500 pt-2">
                <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-terra-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Free shipping
                </span>
                <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-terra-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    Secure checkout
                </span>
                <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-terra-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                    </svg>
                    5-star rated on Etsy
                </span>
            </div>

        </div>
    );
}
