if(wishlistJs){
  document.addEventListener("DOMContentLoaded", function(){
      let wishlistProductJs = document.getElementById('wishlistproductscript')
      let productId = wishlistProductJs.getAttribute('data-productId')
      let variantId = wishlistProductJs.getAttribute('data-variantId')
      let productHandle = wishlistProductJs.getAttribute('data-productHandle')
      let wAddButton = document.querySelector('.add-wishlist');
      let wRemoveButton = document.querySelector('.remove-wishlist');
      let wVariantCheck = document.querySelector('product-form').querySelector('[name=id]');
  
      //check onload if the product/variant is already in wishlist or not
      function wishlistchecker(wpdi, wpdvi, wpdurl){
        if (localStorage.getItem("wishlist") !== null) {
         let wishlistData = JSON.parse(localStorage.getItem("wishlist"));
         let currentvariant = {
            wpdi: wpdi,
            wpdvi: wpdvi,
            wpdurl: wpdurl
         }
  
          wishlistData.some(element => {
            if (element.wpdvi === currentvariant.wpdvi) {
              wAddButton.style.display = 'none';
              wRemoveButton.style.display = 'flex';
            }
          })  
        }
      }
  

      window.onload = function() {
        wishlistchecker( productId, variantId, productHandle);
        addToWishlist();
        removeFromWishlist('product');
      }

      // listening to variant change and update the wishlist attributes
      wVariantCheck.addEventListener('change', function(event){
        wAddButton.setAttribute("data-variant", wVariantCheck.value);
        wRemoveButton.setAttribute("data-variant", wVariantCheck.value);
        wRemoveButton.style.display = 'none';
        wAddButton.style.display = 'flex';
        wishlistchecker(productId, wVariantCheck.value, productHandle)
      });
  
    });
  }