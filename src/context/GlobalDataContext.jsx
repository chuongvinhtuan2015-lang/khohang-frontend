import React, { createContext, useContext, useState, useCallback } from 'react';
import axiosClient from '../services/axiosClient';

const GlobalDataContext = createContext();

export const GlobalDataProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState({
    categories: null,
    suppliers: null,
    products: null
  });

  const fetchCategories = useCallback(async (force = false) => {
    if (!force && categories.length > 0 && (Date.now() - lastFetched.categories < 300000)) return categories;
    try {
      const res = await axiosClient.get('/categories');
      setCategories(res.data);
      setLastFetched(prev => ({ ...prev, categories: Date.now() }));
      return res.data;
    } catch (err) { console.error(err); return []; }
  }, [categories, lastFetched.categories]);

  const fetchSuppliers = useCallback(async (force = false) => {
    if (!force && suppliers.length > 0 && (Date.now() - lastFetched.suppliers < 300000)) return suppliers;
    try {
      const res = await axiosClient.get('/suppliers');
      setSuppliers(res.data);
      setLastFetched(prev => ({ ...prev, suppliers: Date.now() }));
      return res.data;
    } catch (err) { console.error(err); return []; }
  }, [suppliers, lastFetched.suppliers]);

  const fetchAllProducts = useCallback(async (force = false) => {
    if (!force && allProducts.length > 0 && (Date.now() - lastFetched.products < 60000)) return allProducts;
    try {
      setLoading(true);
      const res = await axiosClient.get('/products?limit=1000');
      setAllProducts(res.data.data);
      setLastFetched(prev => ({ ...prev, products: Date.now() }));
      return res.data.data;
    } catch (err) { console.error(err); return []; }
    finally { setLoading(false); }
  }, [allProducts, lastFetched.products]);

  const refreshAll = async () => {
    setLoading(true);
    await Promise.all([fetchCategories(true), fetchSuppliers(true), fetchAllProducts(true)]);
    setLoading(false);
  };

  return (
    <GlobalDataContext.Provider value={{ 
      categories, 
      suppliers, 
      allProducts, 
      loading,
      fetchCategories, 
      fetchSuppliers, 
      fetchAllProducts,
      refreshAll
    }}>
      {children}
    </GlobalDataContext.Provider>
  );
};

export const useGlobalData = () => useContext(GlobalDataContext);
