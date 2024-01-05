if(wishlistJs){
    //  window.onload = async function() {
          if(shopDomain == 'vt-shopi-demo-store.myshopify.com'){
              var storefrontAccessToken = 'b0c9b2b95e8550b9b55cd479f8d211c1';
          }else if(shopDomain == 'vt-netzwelt-bags.myshopify.com'){
              var storefrontAccessToken = '29a66a8488bce2b33baa360a5010dbe8';
          }
          
          const SHOPIFY_GRAPHQL_API_ENDPOINT = '/api/2023-01/graphql.json';
          const endpoint = `https://${shopDomain}${SHOPIFY_GRAPHQL_API_ENDPOINT}`;
          const cache = 'force-cache';
          const wishlistContainer = document.querySelector('.wishlist-display');
          wishlistContainer.innerHTML = '<div class="wishlist-loader"><svg aria-hidden="true" focusable="false" class="spinner" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg"><circle class="path" fill="none" stroke-width="6" cx="33" cy="33" r="30"></circle></svg></div>';
       
          const displayEmptyWishlistMessage = () => {
              wishlistContainer.innerHTML = '<h3>Wishlist is empty!</h3>' +
                  (typeof customerId !== 'undefined' && customerId !== '' && customerId !== null ?
                      '<p>Please add items to your wishlist</p>' :
                      '<p>Please <a href="/account/login">login</a> to save and share your wishlist data</p>');
          };
      
          //get data HTML
          const fetchDisplay = async (fetchDisplayData) => {
              if(fetchDisplayData !== null || fetchDisplayData.length > 0){
                  let productData = '';
                  let formData = '';
                  for (let i = 0; i < fetchDisplayData.length; i++) {
                      let pdDatatt = await queryFunction(fetchDisplayData[i], endpoint, storefrontAccessToken, cache);
                      let wishlistDataVariantId = 'gid://shopify/ProductVariant/' +fetchDisplayData[i].wpdvi;
                      console.log('pdDatatt',pdDatatt);
                      let pdVariantHandle = pdDatatt.handle;
                      let pdId = fetchDisplayData[i].wpdi;
                      let image = pdDatatt.featuredImage.url;
                      let vendor = pdDatatt.vendor;
                      let pdprice = 'From ' + pdDatatt.priceRange.minVariantPrice.amount + ' ' + pdDatatt.priceRange.minVariantPrice.currencyCode;
                      let variantListData = ''
                      let selectedvaraintId, varaintId;
                      let selectedavailableForSale, availableForSale = false;
                      let removeIcon = `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" class="icon icon-close" fill="none" viewBox="0 0 18 17">
                      <path d="M.865 15.978a.5.5 0 00.707.707l7.433-7.431 7.579 7.282a.501.501 0 00.846-.37.5.5 0 00-.153-.351L9.712 8.546l7.417-7.416a.5.5 0 10-.707-.708L8.991 7.853 1.413.573a.5.5 0 10-.693.72l7.563 7.268-7.418 7.417z" fill="currentColor">
                      </svg>`;
                   //   if(pdDatatt.variants > 0){}
                      let pdDatavariants = pdDatatt.variants.edges;
                      if(pdDatavariants.length > 0){
                          variantListData = '<select class="variantoptions">';
                          selectedvaraintId = pdDatavariants[0].node.id.split('ProductVariant/')[1];
                          selectedavailableForSale = pdDatavariants[0].node.availableForSale;
                         
                          for(j= 0; j < pdDatavariants.length; j++){
                              let variantsNode = pdDatavariants[j].node;
                              varaintId = variantsNode.id.split('ProductVariant/')[1];
                              availableForSale = variantsNode.availableForSale;
                              let variantTitle = variantsNode.title;
                              let comparePriceCheck = variantsNode.compareAtPrice; 
                              let pdVariantprice = variantsNode.price.amount + ' ' + variantsNode.price.currencyCode;
                              let pdVariantComparePrice = '';
  
                              if(variantsNode.id == wishlistDataVariantId){
                                  image = variantsNode.image.url;
                                  selectedvaraintId = variantsNode.id.split('ProductVariant/')[1];
                                  selectedavailableForSale = variantsNode.availableForSale;
                                  pdVariantHandle = pdVariantHandle+'?variant='+selectedvaraintId;
                                  if(comparePriceCheck !== null){
                                      pdVariantComparePrice = variantsNode.compareAtPrice.amount + ' '+ variantsNode.compareAtPrice.currencyCode;
                                      pdprice = '<span class="price">' + variantsNode.price.amount + ' ' + variantsNode.price.currencyCode + '</span> <span class="compare-at-price">' + variantsNode.compareAtPrice.amount + ' '+ variantsNode.compareAtPrice.currencyCode + '</span>';
                                  }else{
                                      pdVariantComparePrice = ''
                                      pdprice = '<span class="price">' + variantsNode.price.amount + ' ' + variantsNode.price.currencyCode + '</span>';
                                  }
                                  
                                  variantListData += '<option var-id="'+varaintId+'" value="'+variantTitle+'" data-price="'+pdVariantprice+'" data-compareprice="'+pdVariantComparePrice+'" data-available="'+availableForSale+'" selected="selected">'+variantTitle+'</option>'
                              }else{
                                  if(comparePriceCheck !== null){
                                      pdVariantComparePrice = variantsNode.compareAtPrice.amount + ' '+ variantsNode.compareAtPrice.currencyCode;
                                  }else{
                                      pdVariantComparePrice = ''
                                  }
      
                                  variantListData += '<option var-id="'+varaintId+'" value="'+variantTitle+'" data-price="'+pdVariantprice+'" data-compareprice="'+pdVariantComparePrice+'" data-available="'+availableForSale+'" >'+variantTitle+'</option>'
                              }       
                          }
                          variantListData += '</select>';
                          removeFromWishlistData = `<div class="remove-wishlist" data-variant="`+selectedvaraintId+`" data-product="`+pdId+`" data-product-url="`+pdVariantHandle+`">`+removeIcon+`</div>`;
                          formData = `<form method="post" action="/cart/add" id="wishlist-add-product-`+i+`" accept-charset="UTF-8" class="form" enctype="multipart/form-data" novalidate="novalidate" data-type="add-to-cart-form">
                                      <input type="hidden" name="form_type" value="product"><input type="hidden" name="utf8" value="✓">
                                      <input type="hidden" name="id" value="`+selectedvaraintId+`" class="product-variant-id">
                                      <button id="wishlist-add-product-`+i+`-submit" type="submit" name="add" class="quick-add__submit button button--full-width button--secondary" aria-haspopup="dialog" aria-labelledby="wishlist-add-product-`+i+`-submit" ${!availableForSale ? 'disabled="disabled"' : ''}>
                                          <span class="add-to-cart-message">Add to cart</span>
                                          <div class="loading-overlay__spinner hidden"><svg aria-hidden="true" focusable="false" class="spinner" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg"><circle class="path" fill="none" stroke-width="6" cx="33" cy="33" r="30"></circle></svg></div>
                                      </button>
                                      <input type="hidden" name="product-id" value="`+pdId+`">
                                      </form>`
                      }
                      productData += `<div class="grid__item product-grid_item">`+removeFromWishlistData+`<a href="https://`+shopDomain+`/products/`+pdVariantHandle+`"><div class="image"><img src="`+image+`" alt="`+pdDatatt.title+`" width="100%" height="100%" /></div></a><div class="product-details"><div class="vendor">`+vendor+`</div><div class="product-title">`+pdDatatt.title+`</div><div class="price-container">`+pdprice+`</div>` + variantListData + formData + `</div></div>`;
                      wishlistContainer.innerHTML = '<div class="grid product-grid grid--2-col-tablet-down grid--4-col-desktop">'+productData+'</div>'
   
                  }
                  addToCartFromWishlist();
                  removeFromWishlist('wishlistpage');
                  wvariantChange();
              }else{
                  console.log('nothing here!');
                  displayEmptyWishlistMessage();
              }
          }
  
          // Add to Cart From Wishlist
          function addToCartFromWishlist(){
              let addToCartbuttons = document.querySelectorAll('.quick-add__submit');
              addToCartbuttons.forEach(function (i) {
                  i.addEventListener('click', function(e) {
                      e.preventDefault();
                      i.querySelector('.loading-overlay__spinner').classList.remove('hidden');
                      let addToCartForm = i.closest('form[action$="/cart/add"]');
                      let formData = new FormData(addToCartForm);
                      let variantID = addToCartForm.querySelector('input[name="id"]').value;
  
                      fetch(window.Shopify.routes.root + 'cart/add.js', {
                          method: 'POST',
                          body: formData
                      })
                      .then(response => {
                          i.querySelector('.loading-overlay__spinner').classList.add('hidden');
                          i.querySelector('.add-to-cart-message').textContent = 'Added to Cart!';
                          setTimeout( function(){
                              i.querySelector('.add-to-cart-message').textContent = 'Add to Cart';
                          }, 1000)
                          dispatchvtWishCustomEvent('VTWishlistAddtoCart', variantID);
                          return response.json();
                      })
                      .catch((error) => {
                          console.error('Error:', error);
                          i.querySelector('.loading-overlay__spinner').classList.add('hidden');
                      });
                  })
              })
          }
  
          //Check variant changes
          function wvariantChange(){
              let variantselectors = document.querySelectorAll('select.variantoptions');
              variantselectors.forEach(function (i) {
                  i.addEventListener('change', function(e) {
                      e.preventDefault();
                      let newVarId = i.options[i.selectedIndex].getAttribute('var-id');
                      let newVarAvailability = i.options[i.selectedIndex].getAttribute('data-available');
                      let currentParent = i.closest('.product-details');
                      currentParent.querySelector('input[name="id"]').value = newVarId;
                      if(newVarAvailability === 'true'){
                          currentParent.querySelector('button').removeAttribute("disabled");
                      }else{
                          currentParent.querySelector('button').setAttribute("disabled", "disabled");
                      }
                  })
              })
          }
          
  
          
    //  };
      async function queryFunction(product, endpoint, storefrontAccessToken, cache) {
          let pdId = product.wpdi;
      
          const query = `query getProductsAndVariants {
                  product(id: "gid://shopify/Product/${pdId}"){
                      title
                      handle
                      vendor
                      featuredImage{
                          url
                      }
                      options {
                          id
                          name
                          values
                      }
                      priceRange {
                          minVariantPrice {
                              amount
                              currencyCode
                          }
                      }
                      variants(first:100){
                          edges{
                              node{
                                  id
                                  title
                                  price{
                                      amount
                                      currencyCode
                                  }
                                  compareAtPrice{
                                      amount
                                      currencyCode
                                  }
                                  availableForSale
                                  quantityAvailable
                                  image {
                                      url
                                  }
                              }
                          }
                      }
                  }
          }`;
      
          try {
              const result = await fetch(endpoint, {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                      'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
                  },
                  body: JSON.stringify({
                      ...(query && { query }),
                  }),
                  cache,
              });
      
              const body = await result.json();
              return body.data.product;
      
          } catch (e) {
              console.log(e.message);
          }
      }
  
  
              //check and display data as per localStorage
              window.onload = function() {   
                  let localData = getLocalStorageData();
                  let wishlistData = JSON.parse(localData);
                  if ( localData !== null && wishlistData.length > 0) {
                      fetchDisplay(wishlistData);
                  }else{
                      console.log('local empty');
                      displayEmptyWishlistMessage();
                  }
              }
      }