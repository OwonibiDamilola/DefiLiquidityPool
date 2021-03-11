const DappToken = artifacts.require('DappToken')
const DaiToken =  artifacts.require('DaiToken')
const TokenFarm = artifacts.require('TokenFarm')

require('chai')
  .use(require('chai-as-promised'))
  .should()

function tokens(n) {
  return web3.utils.toWei(n, 'ether');
}

contract('TokenFarm', ([owner, investor]) => {
  let daiToken, dappToken, tokenFarm

  before(async () => {
    daiToken = await DaiToken.new()
    dappToken = await DappToken.new()
    tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address)

    await dappToken.transfer(tokenFarm.address, tokens('1000000'))

    await daiToken.transfer(investor, tokens('100'), {from : owner})
  })

  //this is for the DaiToken
  describe('DaiToken', async() => {
    it('has a name', async() => {
      let daiToken = await DaiToken.new()
      const name = await DaiToken.name
      assert.equal(name, 'TruffleContract')
    })
  })

  // this is for the DappToken
  describe('TruffleContract', async() => {
    it('has a name', async() => {
      let daiToken = await DappToken.new()
      const name = await DappToken.name
      assert.equal(name, 'TruffleContract')
    })
  })

  //this is for the TokenFarm
  describe('Dapp Token Farm', async() => {
    it('has a name', async() => {
      const name = await tokenFarm.name
    })
  })

  it('contract has tokens', async () => {
    let balance = await dappToken.balanceOf(tokenFarm.address)
    assert.equal(balance.toString(), tokens('1000000'))
  })

  describe('Farming tokens', async () => {
    it('rewards investors for staking mDai tokens', async () => {
      let result

      result = await daiToken.balanceOf(investor)
      assert.equal(result.toString(), tokens('100'), 'investor mock Dai wallet balance correct before staking')


      // Stake Mock DAI Tokens
      await daiToken.approve(tokenFarm.address, tokens('100'), {from: investor})
      await tokenFarm.stakeTokens(tokens('100'), { from: investor})

      result = await daiToken.balanceOf(investor)
      assert.equal(result.toString(), tokens('0'), 'investor mock Dai wallet balance correct before staking')

      result = await daiToken.balanceOf(tokenFarm.address)
      assert.equal(result.toString(), tokens('100'), 'Token Farm Mock Dai balance correct after staking')

      result = await tokenFarm.stakingBalance(investor)
      assert.equal(result.toString(), tokens('100'), 'investor staking balance correct after staking')

      result = await tokenFarm.isStaking(investor)
      assert.equal(result.toString(), 'true', 'investor staking balance correct after staking')

      await tokenFarm.issueTokens({from: owner})

      result = await dappToken.balanceOf(investor)
      assert.equal(result.toString(), tokens('100'), 'investor Dapp token wallet balance correct after issuance')

      await tokenFarm.issueTokens({from: investor}).should.be.rejected;

      await tokenFarm.unstakeTokens({from: investor})

      result = await daiToken.balanceOf(investor)
      assert.equal(result.toString(), tokens('100'), 'investor Mock DAI wallet balance correct after staking')

      result = await daiToken.balanceOf(tokenFarm.address)
      assert.equal(result.toString(), tokens('0'), 'Token Farm Mock DAI balance correct after staking')

      result = await tokenFarm.stakingBalance(investor)
      assert.equal(result.toString(), tokens('0'), 'investor staking balance correct after staking')

      result = await tokenFarm.isStaking(investor)
      assert.equal(result.toString(), 'false', 'investor staking status correct after staking')
    })
  })

})
