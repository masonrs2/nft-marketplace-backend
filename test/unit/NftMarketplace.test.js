const {assert, expect} = require("chai")
const {network, deployments, ethers, getNamedAccounts} = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name) 
    ? describe.skip 
    : describe("Nft Marketplace Tests", function () {
    let nftMarketplace, basicNFT 
    const PRICE = ethers.utils.parseEther("0.1")
    const TOKEN_ID = 0
    beforeEach(async function() {
        deployer = (await getNamedAccounts()).deployer
        // player = (await getNamedAccounts()).player
        const accounts = await ethers.getSigners()
        player = accounts[1]
        await deployments.fixture("all")
        nftMarketplace = await ethers.getContract("NftMarketplace")
        basicNFT = await ethers.getContract("BasicNFT")
        await basicNFT.mintNFT() 
        await basicNFT.approve(nftMarketplace.address, TOKEN_ID);
    })

    it("lists and can be bought", async function () {
        await nftMarketplace.listItem(basicNFT.address, TOKEN_ID, PRICE)
        const playerNftMarketplace = nftMarketplace.connect(player)
        await playerNftMarketplace.buyItem(basicNFT.address, TOKEN_ID, {value: PRICE})
        const newOwner = await basicNFT.ownerOf(TOKEN_ID)
        const deployerProceeds = await nftMarketplace.getProceeds(deployer)

        assert(newOwner.toString() == player.address)
        assert(deployerProceeds.toString() == PRICE.toString())
    })

    it("Updates price for a listed NFT for sale.", async function() {
        const UPDATED_PRICE = ethers.utils.parseEther("0.2")
        await nftMarketplace.listItem(basicNFT.address, TOKEN_ID, PRICE)
        await nftMarketplace.updateListing(basicNFT.address, TOKEN_ID, UPDATED_PRICE)
        const listingPrice = await nftMarketplace.getListingPrice(basicNFT.address, TOKEN_ID);
        assert(listingPrice.toString() == UPDATED_PRICE.toString())
    })

    //  it("withdraws proceeds", async function () {
    //     await nftMarketplace.listItem(basicNFT.address, TOKEN_ID, PRICE)
    //     nftMarketplace = nftMarketplace.connect(player)
    //     await nftMarketplace.buyItem(basicNFT.address, TOKEN_ID, { value: PRICE })
    //     nftMarketplace = nftMarketplace.connect(deployer)

    //     const deployerProceedsBefore = await nftMarketplace.getProceeds(deployer.address)
    //     const deployerBalanceBefore = await deployer.getBalance()
    //     const txResponse = await nftMarketplace.withdrawProceeds()
    //     const transactionReceipt = await txResponse.wait(1)
    //     const { gasUsed, effectiveGasPrice } = transactionReceipt
    //     const gasCost = gasUsed.mul(effectiveGasPrice)
    //     const deployerBalanceAfter = await deployer.getBalance()

    //     assert(
    //         deployerBalanceAfter.add(gasCost).toString() ==
    //             deployerProceedsBefore.add(deployerBalanceBefore).toString()
    //     )
    // })
})