import { ImageLoader, ImageProps, OnLoadingComplete, PlaceholderValue, StaticImport } from "next/dist/shared/lib/get-img-props";
import Image from "next/image"
import { useEffect, useState } from "react"
import missing_album_art from '@public/images/missing_album_art.png';


type ImageWithFallbackProps = Omit<ImageProps, "src" | "alt"> & {
    src: string | StaticImport;
    alt: string;
    fallback?: string | StaticImport;
};

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ fallback, alt, src, ...props }) => {
    const fallbackSrc = fallback ?? missing_album_art.src;
    const [imageSrc, setImageSrc] = useState<string | StaticImport>(src);
    const [hasError, setHasError] = useState(false);
    
    useEffect(() => {
        setImageSrc(src ?? fallbackSrc);
        setHasError(false);
    }, [src, fallbackSrc]);

    const handleError = () => {
        if (!hasError) {
            setHasError(true);
            // setImageSrc(fallbackSrc);
        }
    };
    if (!imageSrc) return <></>

    return (
        <Image
            alt={alt ?? "No alt text provided"}
            src={imageSrc}

            onError={handleError}
            {...props}
            width={640}
            height={640}
        />
    );
}

export default ImageWithFallback;
