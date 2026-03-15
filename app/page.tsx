import { getAllBases } from "./actions/base";
import { SignInDialog } from "./components/signin-dialog";
import UploadBaseDialog from "./components/upload-base-dialog";
import { signOut } from "./actions/auth";
import { createClient } from "./lib/supabase_server_client";
import { redirect } from "next/navigation";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const params = await searchParams;
  const code = params.code;
  const serverSupabase = await createClient();

  if (code) {
    const { error } = await serverSupabase.auth.exchangeCodeForSession(code);
    if (!error) {
      redirect("/");
    }
  }

  let data;
  let user = null;
  let connectionError = null;

  try {
    data = await getAllBases();
    // Use the authenticated server client to get the session from cookies
    const {
      data: { user: currentSession },
    } = await serverSupabase.auth.getUser();
    user = currentSession;
  } catch (e: any) {
    console.error("Supabase connection error:", e);
    connectionError = e.message || "Failed to connect to the database";
    data = { success: false, error: connectionError };
  }

  return (
    <div className="container mx-auto min-h-screen pt-6 px-4 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <h1 className="text-3xl sm:text-4xl font-luckiest text-white drop-shadow-lg text-center sm:text-left">
          CoC Base Share
        </h1>

        <div className="flex flex-wrap justify-center gap-3 items-center">
          {user ? (
            <>
              <UploadBaseDialog />
              <div className="flex gap-2 items-center">
                <div className="coc-panel px-3 py-1.5 font-bold text-[#4A3B2A] min-w-[40px] text-center">
                  {user.email?.split("")[0].toUpperCase()}
                </div>
                <form action={signOut}>
                  <button type="submit" className="coc-btn coc-btn-grey px-4 py-1.5 text-sm">
                    Logout
                  </button>
                </form>
              </div>
            </>
          ) : (
            <SignInDialog />
          )}
        </div>
      </div>

      {connectionError && (
        <div
          className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded relative mb-8 font-bold text-center mx-auto max-w-2xl"
          role="alert"
        >
          <strong className="block sm:inline">Database Error: </strong>
          <span className="block sm:inline">
            Could not connect to Supabase. Please check your project status and
            .env configuration.
          </span>
          <p className="text-xs mt-1 opacity-75">{connectionError}</p>
        </div>
      )}

      <h2 className="text-3xl sm:text-4xl text-white drop-shadow-md mb-6 text-center uppercase tracking-wider font-luckiest">
        Recently Added
      </h2>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
        {data && data.data && data.success && data.data.length > 0 ? (
          data.data.map((d) => (
            <BaseCard
              link={d.imgUrl}
              key={d.id}
              thLevel={d.thLevel}
              baseLink={d.link}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-20">
            <p className="text-xl sm:text-2xl font-luckiest text-stone-400">
              {data && !data.success
                ? "Unable to load bases."
                : "No bases found. Be the first to upload!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export const BaseCard = ({
  thLevel,
  link,
  baseLink,
}: {
  thLevel?: string | number;
  link: string;
  baseLink?: string;
}) => {
  return (
    <div className="card coc-panel w-full transform hover:-translate-y-1 transition-transform duration-200 overflow-hidden">
      <figure className="border-b-4 border-[#4A3B2A] relative">
        <img
          src={link || "https://placehold.co/600x400?text=No+Preview"}
          alt="coc base"
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2 bg-coc-orange border-2 border-white px-2 py-1 rounded font-luckiest text-white text-sm shadow-md">
          TH {thLevel || "1"}
        </div>
      </figure>
      <div className="card-body p-4 bg-[#E6E1D6]">
        <h2 className="card-title text-xl sm:text-2xl text-[#4A3B2A] font-luckiest uppercase">
          Town Hall {thLevel || "1"}
        </h2>
        <p className="text-[#5c4d3c] font-medium text-sm sm:text-base line-clamp-2">
          Defend your village with this layout!
        </p>
        <div className="card-actions justify-end mt-2">
          {baseLink ? (
            <a
              href={baseLink}
              target="_blank"
              rel="noopener noreferrer"
              className="coc-btn w-full text-center block no-underline py-2"
            >
              Copy Base
            </a>
          ) : (
            <button className="coc-btn w-full opacity-50 cursor-not-allowed py-2">
              No Link
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
