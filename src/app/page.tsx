import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="max-w-lg min-h-screen flex flex-col justify-center items-center mx-auto pb-32 px-3">
      <section className="my-8">
        <Image
          src="/brand.svg"
          className="mx-auto"
          alt="motionly"
          width="120"
          height="32"
        />
        <p className="font-normal text-2xl my-8 text-center">
          We draft{" "}
          <span className="font-bold text-4xl highlight">
            discovery motions
          </span>{" "}
          for your litigation cases{" "}
          <span className="text-3xl">automagically</span>
        </p>
        <div className="my-4 flex justify-center">
          <Link href="/app" className="btn-blue">
            Start Now
          </Link>
        </div>
      </section>

      <section className="my-8">
        <h2 className="font-bold text-center">How it works</h2>
        <p className="text-center my-2 text-sm text-gray-500">
          Motion drafting has never been so easy - insert questions, review and
          generate a motion draft!
        </p>
        <div className="my-8 border border-gray-100">
          <video
            width="500"
            height="500"
            loop
            autoPlay={true}
            preload="auto"
            playsInline={true}
          >
            <source src="/demo.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </section>

      <section className="my-4">
        <h2 className="font-bold text-center">Our Mission</h2>
        <p className="text-center my-2 text-3xl text-gray-900">
          Make litigation more accessible by lowering discovery costs!
        </p>
      </section>
    </main>
  );
}
