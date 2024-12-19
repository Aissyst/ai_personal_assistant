import type { Metadata } from "next";
import Image from 'next/image';
import UVLogo from '@/public/UVHorizontal-White.svg';
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Alssyst",
  description: "A call with an AI agent.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* <!-- Fathom - beautiful, simple website analytics --> */}
        <script src="https://cdn.usefathom.com/script.js" data-site="ONYOCTXK" defer></script>
        {/* <!-- / Fathom --> */}
      </head>
      <body className=" bg-white text-white">
        <div className=" flex mx-auto justify-between mb-3 bg-customBrown-500 rounded-lg">
          {/* <Image
            src="https://prod-media.redcarnationhotels.com/media/aacdkmyu/12a-svg-logo-476-x-204_white.svg"
            alt="12A logo and wordmark"
            width={100}
            height={50}
          /> */}

          <h1 className="text-2xl font-bold text-white ml-4 mt-3 text-justify">Alssyst</h1>

          <Image
            src="https://i.ibb.co/bdW1BJy/final-logo.png"
            alt="Telic logo and wordmark"
            width={50}
            height={50}
          />

        </div>
        {children}
      </body>
    </html>
  );
}
