import db from "../db.server";
import { json } from "@remix-run/node";

export const loader = async ({ request }) => {
  console.log("My request",request);
  
  const shopId = 'gid://shopify/Shop/1234567890';
  const customerId = 6465415741521;
  
  const existingWishlist = await prisma.vTWishlist.findFirst({
    where: {
      shopId: shopId,
      customerId: customerId,
      collectionId: 1,
    },
    select: {
        products: true
    }
  });
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
    userProducts.push(Record);
  }
  
  return userProducts;
}