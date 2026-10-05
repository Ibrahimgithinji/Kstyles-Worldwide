import Image from "next/image";

export default function HeroMedia({ hasVideo }: { hasVideo: boolean }) {
  return (
    <div className="absolute inset-x-0 bottom-0 top-20 overflow-hidden bg-black">
      {hasVideo ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          className="h-full w-full object-cover object-[50%_0%]"
        >
          <source src="/videos/brand.mp4" type="video/mp4" />
        </video>
      ) : (
        <Image
          src="/images/hero.jpg"
          alt=""
          width={1200}
          height={1600}
          preload
          aria-hidden="true"
          className="h-full w-full object-cover object-[50%_0%]"
        />
      )}
    </div>
  );
}
