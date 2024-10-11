import { ImageLoader, OnLoadingComplete, PlaceholderValue, StaticImport } from "next/dist/shared/lib/get-img-props";
import Image from "next/image"
import { useEffect, useState } from "react"


type ImageWithFallbackProps = Omit<React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>, "height" | "width" | "loading" | "ref" | "alt" | "src" | "srcSet"> & {
    src: string | StaticImport;
    alt: string;
    width?: number | `${number}` | undefined;
    height?: number | `${number}` | undefined;
    fill?: boolean | undefined;
    loader?: ImageLoader | undefined;
    quality?: number | `${number}` | undefined;
    priority?: boolean | undefined;
    loading?: "eager" | "lazy" | undefined;
    placeholder?: PlaceholderValue | undefined;
    blurDataURL?: string | undefined;
    unoptimized?: boolean | undefined;
    overrideSrc?: string | undefined;
    onLoadingComplete?: OnLoadingComplete | undefined;
    layout?: string | undefined;
    objectFit?: string | undefined;
    objectPosition?: string | undefined;
    lazyBoundary?: string | undefined;
    lazyRoot?: string | undefined;
} & React.RefAttributes<HTMLImageElement | null>
& { fallback: string | StaticImport }

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({fallback, alt, src,...props }) => {
    const [error, setError] = useState(null)

    useEffect(() => {
        setError(null)
    }, [src])

    return (
        <Image
            alt={alt}
            onError={setError}
            src={error ? fallback : src}
            {...props}
        />
    )
}

export default ImageWithFallback;