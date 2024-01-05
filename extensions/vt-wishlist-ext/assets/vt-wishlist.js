const wishlistJs = document.getElementById('wishlistcommonscript')
const shopId = wishlistJs.getAttribute('data-shopId');
const customerId = wishlistJs.getAttribute('data-customerId');
const shopDomain = wishlistJs.getAttribute('data-shopDomain');

// Tracking
function dispatchvtWishCustomEvent(eventName, eventData) {
    const customEvent = new CustomEvent(eventName, {
    detail: eventData,
    bubbles: true, // Allows the event to bubble up through the DOM
    });

    // Dispatch the custom event on a target element (or document if not specified)
    document.dispatchEvent(customEvent);
}

function getLocalStorageData(){
    return localStorage.getItem("wishlist");
}

function setLocalStorageData(newData){
    localStorage.setItem('wishlist', JSON.stringify(newData));
}

async function retreiveDataFromAPI() {
  let localwishlistData = getLocalStorageData();
  let wishlistData = JSON.parse(localwishlistData);
    try { 
        let response = await fetch("https://"+shopDomain+"/apps/wish/wishlist-api?shopId="+shopId+"&customerId="+customerId);
        let myFetchedAppData = await response.json();
            
        if (localwishlistData !== null && myFetchedAppData !== null) {
            if (wishlistData.length > 0 && myFetchedAppData.length > 0) {
                const areArraysEqual = arraysAreEqual(wishlistData, myFetchedAppData);
            // compare and merge values 
                if(!areArraysEqual){ 
                    const mergedArray = [...wishlistData, ...myFetchedAppData].filter((value, index, self) =>
                        index === self.findIndex(item => item.wpdvi === value.wpdvi)
                    );
            
                    setLocalStorageData(mergedArray)
                    sendData(mergedArray);
                }
            }else if (wishlistData.length < 1 && myFetchedAppData.length > 0) {
                setLocalStorageData(myFetchedAppData)
            }else if (wishlistData.length > 0 && myFetchedAppData.length < 1) {
                sendData(wishlistData);
            }

        }else if(localwishlistData !== null && myFetchedAppData === null){
            if (wishlistData.length > 0 ){
                sendData(wishlistData);
            }
        }else if(localwishlistData === null && myFetchedAppData !== null){
            if (myFetchedAppData.length > 0 ){
                setLocalStorageData(myFetchedAppData)
            }
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

//check for customer login and update API
const currentUrl = window.location.href;
if(currentUrl.indexOf('/account') > -1){
    if (typeof customerId !== 'undefined' && customerId !== '' && customerId !== null ) {
        retreiveDataFromAPI();
    }
}

//Send data to API
function sendData(data){
    if (typeof customerId !== 'undefined' && customerId !== '' && customerId !== null ) {
        fetch("https://"+shopDomain+"/apps/wish/wishlist-api", {
            method: "POST",
            body: JSON.stringify({
            shopId: 'gid://shopify/Shop/'+shopId,
            customerId: parseInt(customerId),
            productsArray: data
            }),
            headers: {
            "Content-type": "application/json; charset=UTF-8"
            }
        })
            .then((response) => response.json())
            .then((json) => console.log(json));
    }
}

//Add to wishlist 
function addToWishlist (){
    let add = true;
    let wAddButtons = document.querySelectorAll('.add-wishlist');
    wAddButtons.forEach(function (i) {
        i.addEventListener('click', function(e) {
            e.preventDefault();
            let wishlistData;
            let target = e.currentTarget;
            let product = {
                wpdi: target.dataset.product,
                wpdvi: target.dataset.variant,
                wpdurl: target.dataset.productUrl
            }
            if (localStorage.getItem("wishlist") === null) {
                wishlistData = [];
            }else{
                let wishlistData = JSON.parse(localStorage.getItem("wishlist"));
                //check if already exists  if not add it to the array        //let add = true;
                wishlistData.some(element => { if (element.wpdvi === product.wpdvi) {add = false} })
            }
            if(add){
                wishlistData.push(product);
                localStorage.setItem('wishlist', JSON.stringify(wishlistData));
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentNode.querySelector('.remove-wishlist').style.display = 'flex';
                sendData(wishlistData);
            }
        });
    });
}

// Remove From Wishlist
function removeFromWishlist(parent){
    let removebuttons = document.querySelectorAll('.remove-wishlist');
    removebuttons.forEach(function (i) {
        i.addEventListener('click', function(e) {
            e.preventDefault();
            // console.log('remove clicked');
            let target = e.currentTarget;
            let product = {
                wpdi: target.dataset.product,
                wpdvi: target.dataset.variant,
                wpdurl: target.dataset.productUrl
            }
            let wishlistData = JSON.parse(localStorage.getItem("wishlist"));
           // console.log(product);
            let newWishlistData = wishlistData.filter((item) => item.wpdvi !== product.wpdvi);
            localStorage.setItem('wishlist', JSON.stringify(newWishlistData));
            sendData(newWishlistData);
            if(parent == 'wishlistpage'){
                e.currentTarget.parentNode.remove();
            }else{
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentNode.querySelector('.add-wishlist').style.display = 'flex';
            }

            dispatchvtWishCustomEvent('VTWishlistRemovefromWishlist', product.wpdvi);
        });
    });
}

//compare 2 arrays
function arraysAreEqual(array1, array2) {
    if (array1.length !== array2.length) {
        return false;
    }

    for (let i = 0; i < array1.length; i++) {
        const obj1 = array1[i];
        const obj2 = array2[i];

        // Compare each property of the objects
        for (const key in obj1) {
            if (obj1.hasOwnProperty(key) && obj2.hasOwnProperty(key)) {
                if (obj1[key] !== obj2[key]) {
                    return false;
                }
            }
        }
    }

    return true;
}

// listen tracking events Add to Cart and Remove From Wishlist 
document.addEventListener('VTWishlistAddtoCart', function (event) {
    console.log('Add to Cart triggered with variant Id:', event.detail);
});

document.addEventListener('VTWishlistRemovefromWishlist', function (event) {
    console.log('Remove from Wishlist triggered with variant Id:', event.detail);
});


