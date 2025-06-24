"use client";

import React, { useState } from "react";
import { useMqtt } from "@/context/MqttContext";
import { useRouter } from "next/navigation";
import toast, { Toaster } from 'react-hot-toast';
import { Modal, ModalBody, ModalFooter, ModalHeader } from "flowbite-react";

interface Product {
  id: string;
  name: string;
  image_url: string;
  price: number;
  quantity: number;
}

export default function ShopPage() {
  const { products, isConnected, purchaseProduct, wallet, selectWallet } = useMqtt();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNavigating] = useState(false); 
  const router = useRouter();

  const openProductDetail = (product: Product) => {
    setSelectedProduct(product);
    setPurchaseQuantity(1);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handlePurchase = () => {
  if (selectedProduct && wallet) {
    const loadingToast = toast.loading("Processing your purchase...");

    try {
      purchaseProduct(selectedProduct.id, purchaseQuantity);

      toast.success(
        `Successfully purchased ${purchaseQuantity}x ${selectedProduct.name}!`,
        {
          id: loadingToast,
          duration: 4000,
        }
      );

      closeModal();

    } catch {
      toast.error("Purchase failed. Please try again.", {
        id: loadingToast,
      });
    }
  }
};


  const handleWalletSelect = (paymentMethod: string) => {
    const loadingToast = toast.loading('Loading wallet...');
    
    try {
      selectWallet(paymentMethod);
      
      setTimeout(() => {
        toast.success(`${paymentMethod.toUpperCase()} wallet selected successfully!`, {
          id: loadingToast,
          duration: 2000,
        });
      }, 1000);
      
    } catch{
      toast.error('Failed to load wallet', {
        id: loadingToast,
      });
    }
  };

  const backToDashboard = () => {
    router.push("/me");
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to shop...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
      />
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={backToDashboard}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg 
                className="w-5 h-5 text-gray-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-gray-700 font-medium">Back to Dashboard</span>
            </button>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">ShopIt Catalog</h1>
            <p className="text-gray-600">Discover amazing products</p>
            
            {!wallet && !isNavigating && (
              <div className="mt-4 flex justify-center space-x-2">
                <button 
                  onClick={() => handleWalletSelect("dopay")} 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Select DoPay
                </button>
                <button 
                  onClick={() => handleWalletSelect("owo")} 
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Select OWO
                </button>
                <button 
                  onClick={() => handleWalletSelect("ringaja")} 
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  Select Ringaja
                </button>
              </div>
            )}
            
            {wallet && (
              <div className="mt-4 inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                <span className="font-medium">
                  Balance: ${wallet.balance.toLocaleString()} ({wallet.payment_method})
                </span>
              </div>
            )}
          </div>

          {/* Products Grid */}
          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No products available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                  onClick={() => openProductDetail(product)}
                >
                  <div className="relative h-48 bg-gray-200">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder-image.png";
                      }}
                    />
                    {product.quantity === 0 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">Out of Stock</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-blue-600">
                        ${product.price.toLocaleString()}
                      </span>
                      <span className={`px-2 py-1 rounded text-sm ${
                        product.quantity > 0 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        Stock: {product.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Flowbite Modal */}
          <Modal 
            dismissible 
            show={isModalOpen} 
            onClose={closeModal}
            theme={{
              content: {
                base: "relative h-full w-full p-4 md:h-auto",
                inner: "relative rounded-lg bg-white shadow dark:bg-white flex flex-col max-h-[90vh]"
              },
              header: {
                base: "flex items-start justify-between rounded-t dark:border-gray-600 border-b p-4",
                popup: "border-b-0 p-2",
                title: "text-xl font-semibold text-gray-900 dark:text-gray-900",
                close: {
                  base: "ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-200 dark:hover:text-gray-900"
                }
              },
              body: {
                base: "p-6 flex-1 overflow-auto",
                popup: "pt-0"
              },
              footer: {
                base: "flex items-center space-x-2 rounded-b border-gray-200 border-t p-6 dark:border-gray-200",
                popup: "border-t"
              }
            }}
          >
            <ModalHeader>Product Details</ModalHeader>
            <ModalBody>
              {selectedProduct && (
                <div className="space-y-6">
                  {/* Product Image */}
                  <div className="relative h-64 bg-gray-200 rounded-lg">
                    <img
                      src={selectedProduct.image_url}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder-image.png";
                      }}
                    />
                  </div>

                  {/* Product Info */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {selectedProduct.name}
                    </h3>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-bold text-blue-600">
                        ${selectedProduct.price.toLocaleString()}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedProduct.quantity > 0 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {selectedProduct.quantity > 0 
                          ? `${selectedProduct.quantity} in stock`
                          : "Out of stock"
                        }
                      </span>
                    </div>

                    {/* Purchase Section */}
                    {selectedProduct.quantity > 0 && wallet && (
                      <div className="border-t pt-4 space-y-4">
                        <div className="flex items-center space-x-4">
                          <label className="font-medium text-gray-700">Quantity:</label>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setPurchaseQuantity(Math.max(1, purchaseQuantity - 1))}
                              className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white font-bold transition-colors"
                            >
                              -
                            </button>
                            <span className="w-12 text-center font-medium text-lg text-gray-900 bg-gray-100 py-1 px-2 rounded">
                              {purchaseQuantity}
                            </span>
                            <button
                              onClick={() => setPurchaseQuantity(Math.min(selectedProduct.quantity, purchaseQuantity + 1))}
                              className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white font-bold transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-700">Total:</span>
                          <span className="text-xl font-bold text-blue-600">
                            ${(selectedProduct.price * purchaseQuantity).toLocaleString()}
                          </span>
                        </div>

                        {wallet.balance < (selectedProduct.price * purchaseQuantity) && (
                          <p className="text-red-600 text-sm text-center">
                            You need ${((selectedProduct.price * purchaseQuantity) - wallet.balance).toLocaleString()} more
                          </p>
                        )}
                      </div>
                    )}

                    {selectedProduct.quantity === 0 && (
                      <div className="border-t pt-4">
                        <p className="text-red-600 text-center font-medium">
                          This product is currently out of stock
                        </p>
                      </div>
                    )}

                    {!wallet && (
                      <div className="border-t pt-4 space-y-4">
                        <p className="text-yellow-600 text-center">
                          Please select a wallet to make a purchase
                        </p>
                        <div className="flex justify-center space-x-2">
                          <button 
                            onClick={() => handleWalletSelect("dopay")} 
                            className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            DoPay
                          </button>
                          <button 
                            onClick={() => handleWalletSelect("owo")} 
                            className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                          >
                            OWO
                          </button>
                          <button 
                            onClick={() => handleWalletSelect("ringaja")} 
                            className="px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            Ringaja
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              {selectedProduct && selectedProduct.quantity > 0 && wallet && (
                <button 
                  onClick={handlePurchase}
                  disabled={wallet.balance < (selectedProduct.price * purchaseQuantity)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {wallet.balance < (selectedProduct.price * purchaseQuantity)
                    ? "Insufficient Balance"
                    : "Buy Now"
                  }
                </button>
              )}
            </ModalFooter>
          </Modal>
        </div>
      </div>
    </>
  );
}
