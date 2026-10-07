import { expect } from "chai";
import hre from "hardhat";

describe("NFTMarketplace", function () {
  let nftMarketplace;
  let owner;
  let addr1;
  let addr2;
  const listingPrice = hre.ethers.parseEther("0.025");

  beforeEach(async function () {
    const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
    [owner, addr1, addr2] = await hre.ethers.getSigners();
    nftMarketplace = await NFTMarketplace.deploy();
  });

  describe("Minting and Listing", function () {
    it("Should mint a token and list it on the marketplace", async function () {
      const tokenURI = "https://example.com/1";
      const auctionPrice = hre.ethers.parseEther("1");
      
      await expect(
        nftMarketplace.connect(addr1).createToken(tokenURI, auctionPrice, { value: listingPrice })
      ).to.emit(nftMarketplace, "MarketItemCreated")
        .withArgs(1, addr1.address, await nftMarketplace.getAddress(), auctionPrice, false);

      const items = await nftMarketplace.fetchMarketItems();
      expect(items.length).to.equal(1);
      expect(items[0].tokenId).to.equal(1n);
    });

    it("Should fail if listing price is not exact", async function () {
      const tokenURI = "https://example.com/1";
      const auctionPrice = hre.ethers.parseEther("1");
      
      await expect(
        nftMarketplace.connect(addr1).createToken(tokenURI, auctionPrice, { value: hre.ethers.parseEther("0.01") })
      ).to.be.revertedWithCustomError(nftMarketplace, "PriceMustBeEqualToListingPrice");
    });
  });

  describe("Buying", function () {
    it("Should execute a market sale", async function () {
      const tokenURI = "https://example.com/1";
      const auctionPrice = hre.ethers.parseEther("1");
      
      await nftMarketplace.connect(addr1).createToken(tokenURI, auctionPrice, { value: listingPrice });
      
      // addr2 buys the NFT
      await nftMarketplace.connect(addr2).createMarketSale(1, { value: auctionPrice });

      const items = await nftMarketplace.fetchMarketItems();
      expect(items.length).to.equal(0);

      const myNfts = await nftMarketplace.connect(addr2).fetchMyNFTs();
      expect(myNfts.length).to.equal(1);
      expect(myNfts[0].tokenId).to.equal(1n);
    });
  });
});
