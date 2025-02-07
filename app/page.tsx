"use client";

import TypeWriter from "../components/TypeWriter";
import Navbar from "../components/Navbar";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { isConnected } = useAccount();
  const router = useRouter();

  // Redirect to dashboard when connected
  useEffect(() => {
    if (isConnected) {
      router.push("/dashboard");
    }
  }, [isConnected, router]);

  const questions = [
    "Can you help negotiate a settlement?",
    "Can you allocate the funds based on the submitted proposals?",
    "What's the fairest outcome following this whitehat exploit?",
    "Please can you  escrow the funds for this bet?",
  ];

  // Don't render the main content while redirecting
  if (isConnected) {
    return null;
  }

  return (
    <div className="relative">
      <Navbar />

      {/* Hero Section */}
      <section
        id="home"
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-teal-300 to-emerald-500 animate-gradient-hero"></div>
        <div className="relative z-10 text-center flex flex-col items-center gap-2">
          <h1 className="text-9xl font-serif text-white tracking-tight">
            Mediate
          </h1>
          <TypeWriter sentences={questions} />
        </div>
      </section>

      {/* How it Works Section */}
      <section
        id="how-it-works"
        className="relative min-h-screen overflow-hidden pt-32"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-emerald-500 to-cyan-400 animate-gradient-how"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-8">
          <h2 className="text-6xl font-serif text-white mb-12">How it Works</h2>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8">
              <ol className="list-none space-y-8">
                {[1, 2, 3, 4, 5, 6, 7].map((number, index) => (
                  <li key={index} className="flex gap-6 items-start">
                    <span className="font-serif text-4xl text-white/90 font-bold">
                      {number}
                    </span>
                    <div className="text-lg">
                      <span className="font-semibold text-white text-xl">
                        {
                          [
                            "Create Issue",
                            "Register & Setup",
                            "Fund Agent",
                            "Gather Statements",
                            "Submit for Mediation",
                            "AI Analysis",
                            "Distribution",
                          ][index]
                        }
                        :
                      </span>{" "}
                      <span className="text-white/90">
                        {
                          [
                            "User creates an issue, adding necessary details including all parties involved. All sensitive information remains private and secure.",
                            "Platform registers the issue and creates a private agent wallet, ensuring complete separation and security of funds.",
                            "User funds the agent wallet with the assets to be distributed. The wallet is secured and controlled by our trusted AI system.",
                            "Parties provide their positions privately. Each statement is kept confidential and only accessible to the AI mediator.",
                            "The creator submits the issue for mediation, initiating our AI-powered resolution process.",
                            "Our AI agent researches the issue and utilizes deep reasoning models to determine the fairest outcome based on all available information while maintaining privacy.",
                            "The AI agent automatically distributes the funds according to the determined resolution, ensuring swift and secure settlement.",
                          ][index]
                        }
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section
        id="cases"
        className="relative min-h-screen overflow-hidden pt-32"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-500 to-blue-400 animate-gradient-cases"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-8">
          <h2 className="text-6xl font-serif text-white mb-12">Use Cases</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "DAO Fund Distribution",
                content:
                  "Help DAOs make informed decisions on initiative funding by analyzing proposals, evaluating potential impact, and ensuring fair resource allocation across projects. Each participant's private considerations remain confidential.",
              },
              {
                title: "Contract Disputes",
                content:
                  "Resolve disagreements between parties by analyzing contract terms, gathering evidence, and proposing fair settlements. Your private positions and bottom lines remain completely confidential throughout the process.",
              },
              {
                title: "Smart Escrow",
                content:
                  "Secure and transparent escrow services for bets and agreements, with AI-powered verification of outcomes and automated fund distribution. Terms and conditions remain private between parties.",
              },

              {
                title: "Anonymous  Negotiation",
                content:
                  "Facilitate private contract negotiations where parties can specify their minimum acceptable terms without revealing them publicly. Our AI mediator finds optimal agreements while keeping positions completely confidential.",
              },
              {
                title: "Compensation Mediation",
                content:
                  "Mediate contributor compensation disputes in DAOs and web3 organizations. Salary requirements and negotiation positions remain private while reaching fair outcomes.",
              },
              {
                title: "Hack Resolution",
                content:
                  "Facilitate negotiations between protocols and white hat hackers, ensuring fair outcomes while maintaining confidentiality of security details and bounty negotiations.",
              },
            ].map((useCase, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-8"
              >
                <h3 className="text-3xl font-serif text-white mb-4">
                  {useCase.title}
                </h3>
                <p className="text-white/90 text-lg">{useCase.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section
        id="community"
        className="relative min-h-screen overflow-hidden pt-32"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-cyan-400 to-blue-500 animate-gradient-community"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-8">
          <h2 className="text-6xl font-serif text-white mb-12">
            Join Our Community
          </h2>
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8">
              <h3 className="text-2xl font-semibold text-white mb-4">
                Get Early Access
              </h3>
              <p className="text-white/90 mb-6">
                Join our waitlist to be among the first to experience the future
                of private, decentralized mediation. Early users will receive
                exclusive benefits and features. Your information will always
                remain confidential and secure.
              </p>
              <form className="flex flex-col md:flex-row gap-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <button
                  type="submit"
                  className="px-8 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-teal-500 transition-all "
                >
                  Join Waitlist
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
