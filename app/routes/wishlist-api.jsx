import db from "../db.server";
import { json } from "@remix-run/node";

export const loader = async ({ request }) => {
  console.log("My request",request);
  
  const shopId = 'gid://shopify/Shop/1234567890';
  const customerId = 6465415741521;
  const shop = 'test.com';
  const productsArray = [
    { id: '123', variant: '111', handle: 'product-test', new: true },
    { id: '234', variant: '222', handle: 'product-test1', new: true},
    { id: '345', variant: '333', handle: 'product-test2', new: true},
  ];
  const userProducts = [];
  for (const item of productsArray) {
    const existingRecord = await prisma.vTProducts.findFirst({
      where: {
        shopId: shopId,
        productId: item.id,
        variantId: item.variant,
      },
      select: {
        id: true
      }
    });
    if (!existingRecord) {
      const newRecord = await prisma.vTProducts.create({
        data: {
          shopId: shopId,
          productId: item.id,
          variantId: item.variant,
          handle: item.handle
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
      customerId: customerId,
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
        customerId: customerId,
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
  return 'record added!';
}