import { useLoaderData, useSearchParams } from "@remix-run/react";
import { Money, ShopPayButton, useOptimisticVariant } from "@shopify/hydrogen";
import {
  type HydrogenComponentProps,
  type HydrogenComponentSchema,
  useThemeSettings,
} from "@weaverse/hydrogen";
import { forwardRef, useEffect, useState } from "react";
import { getExcerpt } from "~/lib/utils";
import { AddToCartButton, Text } from "~/modules";
import { ProductPlaceholder } from "~/modules/product-form/placeholder";
import { ProductMedia } from "~/modules/product-form/product-media";
import { Quantity } from "~/modules/product-form/quantity";
import { ProductVariants } from "~/modules/product-form/variants";
import type { loader as productLoader } from "~/routes/($locale).products.$productHandle";
import { ProductDetail } from "./product-detail";

interface ProductInformationProps extends HydrogenComponentProps {
  addToCartText: string;
  soldOutText: string;
  unavailableText: string;
  showVendor: boolean;
  showSalePrice: boolean;
  showDetails: boolean;
  showShippingPolicy: boolean;
  showRefundPolicy: boolean;
  hideUnavailableOptions: boolean;
  // product media props
  showThumbnails: boolean;
  numberOfThumbnails: number;
  spacing: number;
  gallerySize?: never;
}

let ProductInformation = forwardRef<HTMLDivElement, ProductInformationProps>(
  (props, ref) => {
    let {
      product,
      shop,
      variants: _variants,
      storeDomain,
    } = useLoaderData<typeof productLoader>();
    let variants = _variants?.product?.variants;

    let selectedVariantOptimistic = useOptimisticVariant(
      product?.selectedVariant || variants?.nodes?.[0],
      variants,
    );
    let [selectedVariant, setSelectedVariant] = useState<any>(
      selectedVariantOptimistic,
    );

    let {
      addToCartText,
      soldOutText,
      unavailableText,
      showVendor,
      showSalePrice,
      showDetails,
      showShippingPolicy,
      showRefundPolicy,
      hideUnavailableOptions,
      showThumbnails,
      numberOfThumbnails,
      spacing,
      children,
      gallerySize,
      ...rest
    } = props;
    let [quantity, setQuantity] = useState<number>(1);
    let [searchParams] = useSearchParams();

    let atcText = selectedVariant?.availableForSale
      ? addToCartText
      : selectedVariant?.quantityAvailable === -1
        ? unavailableText
        : soldOutText;
    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
      if (!selectedVariant && variants?.nodes?.[0]) {
        setSelectedVariant(variants?.nodes?.[0]);
      } else if (
        selectedVariantOptimistic?.id &&
        selectedVariantOptimistic.id !== selectedVariant?.id
      ) {
        setSelectedVariant(selectedVariantOptimistic);
      }
    }, [selectedVariantOptimistic?.id]);
    let { swatches } = useThemeSettings();

    let handleSelectedVariantChange = (variant: any) => {
      setSelectedVariant(variant);
      if (!variant?.selectedOptions) return;
      // update the url
      for (let option of variant.selectedOptions) {
        searchParams.set(option.name, option.value);
      }
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}?${searchParams.toString()}`,
      );
    };

    if (!product)
      return (
        <section className="w-full py-12 md:py-24 lg:py-32" ref={ref} {...rest}>
          <ProductPlaceholder />
        </section>
      );
    if (product && variants) {
      let { title, vendor, descriptionHtml } = product;
      let { shippingPolicy, refundPolicy } = shop;
      return (
        <section ref={ref} {...rest}>
          <div className="container p-6 md:p-8 lg:p-12  lg:px-12 px-4 md:px-6 mx-auto">
            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2 lg:gap-12">
              <ProductMedia
                media={product?.media.nodes}
                selectedVariant={selectedVariant}
                showThumbnails={showThumbnails}
                numberOfThumbnails={numberOfThumbnails}
                spacing={spacing}
              />
              <div className="flex flex-col justify-start space-y-5">
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                      {title}
                    </h2>
                    {showVendor && vendor && (
                      <Text className={"opacity-50 font-medium"}>{vendor}</Text>
                    )}
                  </div>
                  <p className="text-2xl md:text-3xl/relaxed lg:text-2xl/relaxed xl:text-3xl/relaxed">
                    {selectedVariant ? (
                      <Money
                        withoutTrailingZeros
                        data={selectedVariant.price}
                        as="span"
                      />
                    ) : null}
                  </p>
                  {children}
                  <p
                    suppressHydrationWarning
                    className="max-w-[600px] leading-relaxed prose"
                    dangerouslySetInnerHTML={{
                      __html: descriptionHtml,
                    }}
                  />
                  <ProductVariants
                    product={product}
                    selectedVariant={selectedVariant}
                    onSelectedVariantChange={handleSelectedVariantChange}
                    swatch={swatches}
                    variants={variants}
                    options={product?.options}
                    handle={product?.handle}
                    hideUnavailableOptions={hideUnavailableOptions}
                  />
                </div>
                <Quantity value={quantity} onChange={setQuantity} />
                <AddToCartButton
                  disabled={!selectedVariant?.availableForSale}
                  lines={[
                    {
                      merchandiseId: selectedVariant?.id,
                      quantity,
                      selectedVariant,
                    },
                  ]}
                  variant="primary"
                  data-test="add-to-cart"
                  className="w-full hover:border-black"
                >
                  {atcText}
                </AddToCartButton>
                {selectedVariant?.availableForSale && (
                  <ShopPayButton
                    width="100%"
                    variantIdsAndQuantities={[
                      {
                        id: selectedVariant?.id,
                        quantity,
                      },
                    ]}
                    storeDomain={storeDomain}
                  />
                )}
                <div className="grid gap-4 py-4">
                  {showShippingPolicy && shippingPolicy?.body && (
                    <ProductDetail
                      title="Shipping"
                      content={getExcerpt(shippingPolicy.body)}
                      learnMore={`/policies/${shippingPolicy.handle}`}
                    />
                  )}
                  {showRefundPolicy && refundPolicy?.body && (
                    <ProductDetail
                      title="Returns"
                      content={getExcerpt(refundPolicy.body)}
                      learnMore={`/policies/${refundPolicy.handle}`}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      );
    }
    return <div ref={ref} {...rest} />;
  },
);

export default ProductInformation;

export let schema: HydrogenComponentSchema = {
  type: "product-information",
  title: "Product information",
  childTypes: ["judgeme"],
  limit: 1,
  enabledOn: {
    pages: ["PRODUCT"],
  },
  inspector: [
    {
      group: "Product form",
      inputs: [
        {
          type: "text",
          label: "Add to cart text",
          name: "addToCartText",
          defaultValue: "Add to cart",
          placeholder: "Add to cart",
        },
        {
          type: "text",
          label: "Sold out text",
          name: "soldOutText",
          defaultValue: "Sold out",
          placeholder: "Sold out",
        },
        {
          type: "text",
          label: "Unavailable text",
          name: "unavailableText",
          defaultValue: "Unavailable",
          placeholder: "Unavailable",
        },
        {
          type: "switch",
          label: "Show vendor",
          name: "showVendor",
          defaultValue: true,
        },
        {
          type: "switch",
          label: "Show sale price",
          name: "showSalePrice",
          defaultValue: true,
        },
        {
          type: "switch",
          label: "Show details",
          name: "showDetails",
          defaultValue: true,
        },
        {
          type: "switch",
          label: "Show shipping policy",
          name: "showShippingPolicy",
          defaultValue: true,
        },
        {
          type: "switch",
          label: "Show refund policy",
          name: "showRefundPolicy",
          defaultValue: true,
        },
        {
          label: "Hide unavailable options",
          type: "switch",
          name: "hideUnavailableOptions",
        },
      ],
    },
    {
      group: "Product Media",
      inputs: [
        {
          label: "Show thumbnails",
          name: "showThumbnails",
          type: "switch",
          defaultValue: true,
        },
        {
          label: "Number of thumbnails",
          name: "numberOfThumbnails",
          type: "range",
          condition: "showThumbnails.eq.true",
          configs: {
            min: 1,
            max: 10,
          },
          defaultValue: 4,
        },
        {
          label: "Gap between images",
          name: "spacing",
          type: "range",
          configs: {
            min: 0,
            step: 2,
            max: 100,
          },
          defaultValue: 10,
        },
      ],
    },
  ],
};
