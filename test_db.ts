import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL as string, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string);
async function test() {
  const { error } = await supabase.from('products').upsert({
    id: 'test-product-999',
    name: 'Test Product',
    category: 'Skin Care',
    description: 'Test desc',
    image: '',
    herbs: '',
    benefits: [],
    is_available: true,
    details: '',
    how_to_use: '',
    tamil_name: '',
    nutritional_info: null
  });
  console.log('Error 1:', error);

  const { error: error2 } = await supabase.from('products').upsert({
    id: 'test-product-999',
    name: 'Test Product',
    category: 'Skin Care',
    description: 'Test desc',
    image: '',
    herbs: 'Some Herbs',
    benefits: ['Good'],
    is_available: true,
    details: 'Some Details',
    how_to_use: 'Use it well',
    tamil_name: '',
    nutritional_info: null
  });
  console.log('Error 2:', error2);
}
test();
