import db from "../db.server";
import { json } from "@remix-run/node";

export const loader = async ({ request }) => {
  try {
    if (!request) {
      throw new Error('Request object is not available');
    }
    const queryParams = new URL(request.url).searchParams;
    if(queryParams){
      let shopId = queryParams.get('shopId');
      if (!shopId.includes("gid://")) {
        shopId = 'gid://shopify/Shop/'+shopId
      }
      const customerId = queryParams.get('customerId');
      const existingWishlist = await prisma.vTWishlist.findFirst({
        where: {
          shopId: shopId,
          customerId: parseInt(customerId),
          collectionId: 1,
        },
        select: {
          products: true
        }
      });
      console.log("existingWishlist ",existingWishlist);
      if(existingWishlist){
        if(existingWishlist.products == ''){
          return [];
        }
        const productsArray = existingWishlist.products.split(',');
        const userProducts = [];
        for (const item of productsArray) {
          const Record = await prisma.vTProducts.findFirst({
            where: {
              id: parseInt(item),
            },
            select: {
              productId: true,
              variantId: true,
              handle: true,
            }
          });
          userProducts.push(
            {
              wpdi: Record.productId,
              wpdvi: Record.variantId,
              wpdurl: Record.handle
            }
          );
        }
        return userProducts;
      }
      return null;
    }
    return 'Please check, your data is missing!';

  } catch (error) {
    console.error('Error:', error.message);
    return json({ success: false, error: error.message }, { status: 500 });
  }
  
}
export const action = async ({ request }) => {
  try{
    if (!request) {
      throw new Error('Request object is not available');
    }
    const postdata = await request.json();
    if(postdata){
      console.log("POST Params: ",postdata)
      const shopId = postdata.shopId;
      const customerId = postdata.customerId;
      const productsArray = postdata.productsArray;
      
      const userProducts = [];
        if(productsArray.length < 1){
          const existingWishlist = await prisma.vTWishlist.findFirst({
            where: {
              shopId: shopId,
              customerId: parseInt(customerId),
              collectionId: 1,
            },
            select: {
              id: true
            }
          });

          await prisma.vTWishlist.update({
            where: {
              id: existingWishlist.id
            },
            data: {
              products: ''
            },
          });
        }
        for (const item of productsArray) {
          const existingRecord = await prisma.vTProducts.findFirst({
            where: {
              shopId: shopId,
              productId: item.wpdi,
              variantId: item.wpdvi,
            },
            select: {
              id: true
            }
          });
          if (!existingRecord) {
            const newRecord = await prisma.vTProducts.create({
              data: {
                shopId: shopId,
                productId: item.wpdi,
                variantId: item.wpdvi,
                handle: item.wpdurl
              }
            });
            userProducts.push(newRecord.id)
          }else{
            userProducts.push(existingRecord.id)
          }
        } 
        const jsonProducts = userProducts.join(',')
        const existingWishlist = await prisma.vTWishlist.findFirst({
          where: {
            shopId: shopId,
            customerId: parseInt(customerId),
            collectionId: 1,
          },
          select: {
            id: true
          }
        });
      
      
      if(!existingWishlist){
        await prisma.vTWishlist.create({
          data: {
            shopId: shopId,
            customerId: parseInt(customerId),
            collectionId: 1,
            products: jsonProducts
          }
        });
      }else{
        await prisma.vTWishlist.update({
          where: {
            id: existingWishlist.id
          },
          data: {
            products: jsonProducts
          },
        });
      }
   
      return 'Updated your wishlist!';
    }
    return 'Please check, your data is missing!';
  }
  catch (error) {
    console.error('Error:', error.message);
    return json({ success: false, error: error.message }, { status: 500 });
  }
};