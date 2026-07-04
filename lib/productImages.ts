export const getProductImage = (name: string, category: string, imageUrl?: string, context?: 'detail' | 'tile') => {
  if (imageUrl) return imageUrl;
  
  const placeholders: Record<string, string> = {
    'Hair Care': 'https://images.unsplash.com/photo-1608248593842-83b6f0010903?auto=format&fit=crop&q=80',
    'Food & Nutrition': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80',
    'Skin Care': 'https://images.unsplash.com/photo-1616766468449-36471801ccbe?auto=format&fit=crop&q=80',
  };
  
  return placeholders[category] || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80';
};

export const onImgError = (e: any) => {
  e.currentTarget.src = 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80';
};
