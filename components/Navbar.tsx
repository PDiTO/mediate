import Link from "next/link";
import { useState, useEffect } from "react";
import { useAccount, useSignMessage } from "wagmi";
import {
  Wallet,
  ConnectWallet,
  ConnectWalletText,
  WalletDropdown,
  WalletDropdownDisconnect,
  WalletDropdownFundLink,
} from "@coinbase/onchainkit/wallet";
import { Address, Identity } from "@coinbase/onchainkit/identity";
import { ConnectButton } from "@rainbow-me/rainbowkit";
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { isConnected, address, chainId } = useAccount();
  const { signMessage } = useSignMessage();

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

  const scrollToSection = (sectionId: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      // Update URL without jump
      window.history.pushState({}, "", `/#${sectionId}`);
    }
  };

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
            onClick={!isConnected ? scrollToSection("home") : undefined}
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
                  href="/dashboard"
                  className="text-white/90 hover:text-white transition-colors"
                >
                  My Mediations
                </Link>
                <Link
                  href="/create"
                  className="text-white/90 hover:text-white transition-colors"
                >
                  Create New
                </Link>
                <Link
                  href="/test"
                  className="text-white/90 hover:text-white transition-colors"
                >
                  Test
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/#how-it-works"
                  onClick={scrollToSection("how-it-works")}
                  className="text-white/90 hover:text-white transition-colors cursor-pointer"
                >
                  How it Works
                </Link>
                <Link
                  href="/#cases"
                  onClick={scrollToSection("cases")}
                  className="text-white/90 hover:text-white transition-colors cursor-pointer"
                >
                  Use Cases
                </Link>

                <Link
                  href="/#community"
                  onClick={scrollToSection("community")}
                  className="text-white/90 hover:text-white transition-colors cursor-pointer"
                >
                  Community
                </Link>
              </>
            )}
            <Wallet>
              <ConnectWallet className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg backdrop-blur-sm transition-all">
                {isConnected ? (
                  <Address
                    className="text-white text-md font-bold"
                    hasCopyAddressOnClick={false}
                  />
                ) : (
                  <ConnectWalletText>Launch App</ConnectWalletText>
                )}
              </ConnectWallet>

              {/* <ConnectButton /> */}

              <WalletDropdown className="bg-transparent text-white rounded-lg backdrop-blur-sm transition-all">
                <Identity
                  className="bg-white/20 hover:bg-white/30 text-white py-3"
                  hasCopyAddressOnClick
                >
                  <Address className="text-white text-md font-bold" />
                </Identity>
                <WalletDropdownFundLink className="bg-white/20 hover:bg-white/30 text-white transition-all" />
                <WalletDropdownDisconnect className="bg-white/20 hover:bg-white/30 text-white transition-all" />
              </WalletDropdown>
            </Wallet>
          </div>
        </div>
      </div>
    </nav>
  );
}
