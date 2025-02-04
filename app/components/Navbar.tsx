import Link from "next/link";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import {
  Wallet,
  ConnectWallet,
  ConnectWalletText,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import { Name } from "@coinbase/onchainkit/identity";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { isConnected } = useAccount();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 ${
        scrolled ? "bg-black/20" : ""
      }`}
    >
      <div
        className={`w-full px-8 py-4 border-b transition-colors duration-300 ${
          scrolled ? "border-white/10" : "border-transparent"
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <Link
            href={isConnected ? "/dashboard" : "/#home"}
            className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                scrolled ? "bg-white/20" : "bg-white/10"
              }`}
            >
              <span className="text-2xl font-serif">M</span>
            </div>
            <span className="text-2xl font-serif">Mediate</span>
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center gap-8">
            {isConnected ? (
              <>
                <Link
                  href="/dashboard/mediations"
                  className="text-white/90 hover:text-white transition-colors"
                >
                  My Mediations
                </Link>
                <Link
                  href="/dashboard/create"
                  className="text-white/90 hover:text-white transition-colors"
                >
                  Create New
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="text-white/90 hover:text-white transition-colors"
                >
                  Settings
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/#how-it-works"
                  className="text-white/90 hover:text-white transition-colors"
                >
                  How it Works
                </Link>
                <Link
                  href="/#cases"
                  className="text-white/90 hover:text-white transition-colors"
                >
                  Use Cases
                </Link>
                <Link
                  href="/#technology"
                  className="text-white/90 hover:text-white transition-colors"
                >
                  Technology
                </Link>
                <Link
                  href="/#community"
                  className="text-white/90 hover:text-white transition-colors"
                >
                  Community
                </Link>
              </>
            )}
            <Wallet>
              <ConnectWallet className="bg-red-500">
                <ConnectWalletText>LaunchA</ConnectWalletText>
              </ConnectWallet>
              <WalletDropdown>
                <WalletDropdownDisconnect />
              </WalletDropdown>
            </Wallet>
          </div>
        </div>
      </div>
    </nav>
  );
}
