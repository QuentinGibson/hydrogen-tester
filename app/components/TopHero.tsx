import clsx from 'clsx';
import type { SerializeFrom } from '@shopify/remix-oxygen';
import { MediaFile } from '@shopify/hydrogen';
import type {
  MediaImage,
  Media,
  Video as MediaVideo,
} from '@shopify/hydrogen/storefront-api-types';
import { Heading, Link, Text } from '~/components';
import type { CollectionHero } from '~/routes/($lang)/index';

/**
 * Hero component that renders metafields attached to collection resources
 **/
export function TopHero({
  byline,
  cta,
  handle,
  heading,
  height,
  loading,
  spread,
  spreadSecondary,
  top,
}: SerializeFrom<CollectionHero>) {
  return (
    <section
      className={clsx(
        'relative justify-end flex flex-col w-full',
        top && '-mt-nav',
        height === 'full'
          ? 'h-screen'
          : 'aspect-[4/5] sm:aspect-square md:aspect-[5/4] lg:aspect-[3/2] xl:aspect-[2/1]',
      )}
    >
      <div className="relative grid flex-grow grid-flow-col pointer-events-none auto-cols-fr content-stretch overflow-clip">
        <div className='flex flex-col h-full px-12 mt-32'>
          <h2 className='mb-4 font-extrabold text-8xl'>Your Future Your Fashion</h2>
          <p className="mb-4 leading-loose">Welcome to our female clothing store, where fashion and quality go hand in hand! Our mission is to provide you with the latest styles and trends, made with the highest quality materials. Whether you're looking for a casual outfit or a formal dress, we've got you covered. Shop with us today and experience the best in fashion and quality!</p>
          <div className="mt-4">
            <Link to="/collections" className="px-8 py-4 bg-teal-300">Shop Now</Link>
          </div>
        </div>
        {spreadSecondary?.reference && (
          <div className="hidden px-24 py-10 md:block">
            <SpreadMedia
              sizes="(min-width: 80em) 500, (min-width: 48em) 450, 500"
              widths={[450, 600]}
              width={375}
              data={spreadSecondary.reference as Media}
              loading={loading}
            />
          </div>
        )}
      </div>
      <div className="flex flex-col items-baseline justify-between gap-4 px-6 py-8 sm:px-8 md:px-12 bg-gradient-to-t dark:from-contrast/60 dark:text-primary from-primary/60 text-contrast">
        {heading?.value && (
          <Heading format as="h2" size="display" className="max-w-md">
            {heading.value}
          </Heading>
        )}
        {byline?.value && (
          <Text format width="narrow" as="p" size="lead">
            {byline.value}
          </Text>
        )}
        {cta?.value && <Text size="lead">{cta.value}</Text>}
      </div>
    </section>
  );
}

interface SpreadMediaProps {
  data: Media | MediaImage | MediaVideo;
  loading?: HTMLImageElement['loading'];
  decoding?: HTMLImageElement['decoding'];
  scale?: 2 | 3;
  sizes: string;
  width: number;
  widths: number[];
}

function SpreadMedia({
  data,
  loading,
  decoding,
  scale,
  sizes,
  width,
  widths,
}: SpreadMediaProps) {
  return (
    <MediaFile
      data={data}
      className="block object-cover w-full h-full"
      mediaOptions={{
        video: {
          controls: false,
          muted: true,
          loop: true,
          playsInline: true,
          autoPlay: true,
          width: (scale ?? 1) * width,
          previewImageOptions: { scale, src: data.previewImage?.url ?? '' },
        },
        image: {
          loading,
          decoding,
          loaderOptions: { scale, crop: 'center' },
          widths,
          sizes,
          width,
          alt: data.alt || '',
        },
      }}
    />
  );
}
