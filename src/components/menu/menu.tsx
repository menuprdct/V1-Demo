'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import FoodCard from '@/components/foodCard/FoodCard';
import styles from './menu.module.css';
import { FoodItem } from '@/types/types';

export default function Menu() {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);

  useEffect(() => {
    async function fetchFoodItems() {
      const { data, error } = await supabase
        .from('food_items')
        .select(`
          id,
          name,
          price,
          image_urls,
          reviews (
            rating,
            comment,
            user_email
          )
        `);

      if (error) {
        console.error('Error fetching food items:', error);
        return;
      }
      setFoodItems(data || []);
    }

    fetchFoodItems();
  }, []);
  return (
    <div className={styles.menuContainer}>
      {foodItems.map((item) => (
        <FoodCard key={item.id} item={item} />
      ))}
    </div>
  );
}
