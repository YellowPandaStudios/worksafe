import { MapBlock } from '@/types/blocks';

interface MapProps {
  block: MapBlock;
}

export function Map({ block }: MapProps) {
  const { title, address, lat, lng, zoom } = block;

  // Google Maps embed URL
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&q=${lat},${lng}&zoom=${zoom}`;

  return (
    <div>
      {title && (
        <h2 className="text-3xl font-bold mb-4">{title}</h2>
      )}
      {address && (
        <p className="text-muted-foreground mb-4">{address}</p>
      )}
      <div className="relative aspect-video rounded-lg overflow-hidden">
        <iframe
          src={mapUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}
