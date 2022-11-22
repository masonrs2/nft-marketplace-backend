const { ethers } = require("hardhat")

const PRICE = ethers.utils.parseEther("0.1")

async function mintAndList() {
    const nftMarketplace = await ethers.getContract("NftMarketplace")
    const basicNFT = await ethers.getContract("BasicNFT")
    console.log("Minting an NFT... ") 
    const mintTx = await basicNFT.mintNFT()
    const mintTxReceipt = await mintTx.wait(1)
    const tokenId = mintTxReceipt.events[0].args.tokenId
    
    console.log("Approving NFT... ") 

    const approvalTx = await basicNFT.approve(nftMarketplace.address, tokenId)
    await approvalTx.wait(1)
    console.log("Listing NFT...")
    const txt = await nftMarketplace.listItem(basicNFT.address, tokenId, PRICE) 
    await txt.wait(1)
    console.log("Listed!")

}

mintAndList() 
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })