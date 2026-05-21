import { useState, useEffect } from "react";
import { PRODUCTS } from "../constants";
import { Product } from "../types";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let customPacksList: Product[] = [];
    let overrides: Record<string, any> = {};

    const updateProducts = () => {
      // Apply overrides (names, prices, originalPrices) to existing default PRODUCTS
      const mergedBaseProducts = PRODUCTS.map(product => {
        if (overrides[product.id]) {
          const override = overrides[product.id];
          return {
            ...product,
            name: typeof override.name === 'string' && override.name.trim() ? override.name : product.name,
            price: typeof override.price === 'number' ? override.price : product.price,
            originalPrice: typeof override.originalPrice === 'number' ? override.originalPrice : product.originalPrice,
            deliveryLink: typeof override.deliveryLink === 'string' && override.deliveryLink.trim() ? override.deliveryLink : product.deliveryLink,
            thumbnail: typeof override.thumbnail === 'string' && override.thumbnail.trim() ? override.thumbnail : product.thumbnail,
          };
        }
        return product;
      });

      // Combine with new custom bundles uploaded in Admin
      const allProducts = [...mergedBaseProducts, ...customPacksList];
      setProducts(allProducts);
      setLoading(false);
    };

    // Subscribe live to custom uploaded packs
    const unsubscribeCustom = onSnapshot(collection(db, 'custom_packs'), (snapshot) => {
      const packs: Product[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        packs.push({
          id: docSnap.id,
          name: data.name || '',
          price: Number(data.price) || 0,
          originalPrice: Number(data.originalPrice) || 0,
          deliveryLink: data.deliveryLink || '',
          thumbnail: data.thumbnail || '',
          description: data.description || '',
          tags: data.tags || ["Custom"],
          previews: data.previews || [],
          details: data.details || ["Instant Download", "Ready to Upload"]
        });
      });
      customPacksList = packs;
      updateProducts();
    }, (error) => {
      console.error("Error fetching Firestore custom packs:", error);
      setLoading(false);
    });

    // Subscribe live to pricing & name overrides of default PRODUCTS
    const unsubscribeOverrides = onSnapshot(collection(db, 'pricing_overrides'), (snapshot) => {
      const ov: Record<string, any> = {};
      snapshot.forEach(docSnap => {
        ov[docSnap.id] = docSnap.data();
      });
      overrides = ov;
      updateProducts();
    }, (error) => {
      console.error("Error fetching Firestore pricing overrides:", error);
      setLoading(false);
    });

    return () => {
      unsubscribeCustom();
      unsubscribeOverrides();
    };
  }, []);

  return { products, loading };
}

