const { assert, should } = require('chai')
const { default: Web3 } = require('web3')

const RPToken = artifacts.require('./RPToken.sol')
const BankLiability = artifacts.require('./BankLiability.sol')
const ProductManager = artifacts.require('./ProductManager.sol')

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('RPToken', ([admin, bank1, issuer, unused2, unused3, bank2, user, merchant, unused4, unused5]) => {
  console.log(unused5)
  let rpToken
  let bankLiability
  let productManager

  before(async () => {
    rpToken = await RPToken.deployed()
    bankLiability = await BankLiability.deployed()
    productManager = await ProductManager.deployed()
  })

  describe('deployment', async () => {
    it('deploys successfully', async () => {
      const address = await rpToken.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })

    /* it('has a name', async () => {
      const name = await decentragram.name()
      assert.equal(name, 'Decentragram')
    }) */
  })

  describe('products', async () => {
    let result, productCount
    const hash = 'abc123'

    before(async () => {
      result = await productManager.uploadProduct(hash, 'Product name', 'Product description', 100, { from: merchant })
      console.log()
      productCount = await productManager._productCount()
    })

    it('creates products', async () => {
      // SUCCESS
      assert.equal(productCount, 1)
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), productCount.toNumber(), 'id is correct')
      assert.equal(event.imgHash, hash, 'image hash is correct')
      assert.equal(event.name, 'Product name', 'name is correct')
      assert.equal(event.description, 'Product description', 'description is correct')
      assert.equal(event.price, 100, 'price is correct')
      assert.equal(event.merchant, merchant, 'merchant is correct')

      // FAILURE: Image must have hash
      await productManager.uploadProduct('', 'Product name', 'Product description', 100, { from: merchant }).should.be.rejected;

      // FAILURE: Product must have name
      await productManager.uploadProduct('Image hash', '', 'Product description', 100, { from: merchant }).should.be.rejected;
    })

    it('removes products', async () => {
      result = await productManager.removeProduct(1, { from: merchant })
      // SUCCESS
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), productCount.toNumber(), 'id is correct')
      assert.equal(event.imgHash, hash, 'image hash is correct')
      assert.equal(event.name, 'Product name', 'name is correct')
      assert.equal(event.description, 'Product description', 'description is correct')
      assert.equal(event.price, 100, 'price is correct')
      assert.equal(event.merchant, merchant, 'merchant is correct')

      // FAILURE: No such product
      await productManager.removeProduct(2, { from: merchant }).should.be.rejected;
    })
    it('confirm', async () => {
      result = await rpToken.confirm(merchant, 100, 0, { from: user }).should.be.rejected;
    })

    /* //check from Struct
    it('lists images', async () => {
      const image = await decentragram.images(imageCount)
      assert.equal(image.id.toNumber(), imageCount.toNumber(), 'id is correct')
      assert.equal(image.hash, hash, 'Hash is correct')
      assert.equal(image.description, 'Image description', 'discription is correct')
      assert.equal(image.tipAmount, '0', 'tip amount is correct')
      assert.equal(image.author, author, 'author is correct')
    })

    it('allows users to tip images', async () => {
      let oldAuthorBalance
      oldAuthorBalance = await web3.eth.getBalance(author)
      oldAuthorBalance = new web3.utils.BN(oldAuthorBalance)

      result = await decentragram.tipImageOwner(imageCount, { from: tipper, value: web3.utils.toWei('1', 'ether') })
      // SUCCESS
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), imageCount.toNumber(), 'id is correct')
      assert.equal(event.hash, hash, 'Hash is correct')
      assert.equal(event.description, 'Image description', 'description is correct')
      assert.equal(event.tipAmount, '1000000000000000000', 'tip amount is correct')
      assert.equal(event.author, author, 'author is correct')

      let newAuthorBalance
      newAuthorBalance = await web3.eth.getBalance(author)
      newAuthorBalance = new web3.utils.BN(newAuthorBalance)

      let tipImageOwner
      tipImageOwner = web3.utils.toWei('1', 'ether')
      tipImageOwner = new web3.utils.BN(tipImageOwner)

      const expectedBalance = oldAuthorBalance.add(tipImageOwner)
      
      assert.equal(newAuthorBalance.toString(), expectedBalance.toString()) 

      // FAILURE: Tries to tip a image that does not exist
      await decentragram.tipImageOwner(99, { from: tipper, value: web3.utils.toWei('1', 'ether') }).should.be.rejected
    }) */
  })
})