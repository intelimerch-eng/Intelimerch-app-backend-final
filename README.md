Fan,
Cloudinary Setup,
Email integration,
Final Review and Correction


8. Before testing
Test these cases in order:
1. Create a campaign with an image.
2. Create one with audio.
3. Create one with a link and no file.
4. Create one with multiple perks.
5. Submit an invalid perk ID and verify the campaign is not created.
6. Force a database failure after upload and verify the Cloudinary asset is cleaned up.

product = {
    artistId,
    name,
    description,
    productType,
    productCode,
}

productVariant = {
    productId,
    colorId,
    sizeId,
    sku
}

ProductCodeCounter = {
    productType,
    nextNumber
}

productType = {
    productTypeName,

}

productCode = {
    productType,
    code
}

colorCode = {
    colorName,  //black
    code        //BLK
}

sizeCode = {
    size,  //medium, 42
    code   //M, 42
}

SKU FORMULAR:
    sku = [productCode]-[colorCode]-[sizeCode]


A quick confirmation sir,
what specification on which to put on, polo or tshirt ?

SKU Best Practices
✅ One SKU per variant.
✅ SKU must be unique.
✅ Generate SKUs automatically.
✅ Store SKU on ProductVariant.
✅ Keep product codes unique.
✅ Use predefined color and size codes.
❌ Don't use the MongoDB _id as the SKU.
❌ Don't let multiple variants share the same SKU.
❌ Don't regenerate SKUs after a product is in use unless absolutely necessary.

For most e-commerce applications, following these principles will give you a robust, production-ready SKU implementation.

How Numbers In ProductCode in SKUs are Generated;
Formular = Category + Sequence (Recommended)
Category = TSH
Sequence = 001
Hence,
ProductCode = TSH001

How To Determine the Next Number;
Create a Counter Table For Each Product;

product_codes
-------------
type   nextNumber

TSH    4
HDY    3


Admin operations on Artist account;
Admin operation on artist account has been designed to be such that,
there will be seperate endpoints for the write operations to be performed
on an artist's account and that will be an admin endpoint seperate from
an artist would use in performing the same action. Every action performed
is logged to view who perform which action.
Developer Infomation:
While the endpoints are seperated, the core business logic for the operation
are seperated in into a service file which will be called upon when such
is needed, hence keeping the process the same.