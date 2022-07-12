import abi from '../utils/BuyMeADonut.json';
import { ethers } from "ethers";
import Head from 'next/head'
import Image from 'next/image'
import React, { useEffect, useState } from "react";
import styles from '../styles/Home.module.css'

export default function Home() {
  // Contract Address & ABI
  const contractAddress = "0x251CD26C0D4d424E3e42e181B693D4E97EA30eA3";
  const contractABI = abi.abi;

  // Component state
  const [currentAccount, setCurrentAccount] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [memos, setMemos] = useState([]);

  const onNameChange = (event) => {
    setName(event.target.value);
  }

  const onMessageChange = (event) => {
    setMessage(event.target.value);
  }

  // Wallet connection logic
  const isWalletConnected = async () => {
    try {
      const { ethereum } = window;

      const accounts = await ethereum.request({method: 'eth_accounts'})
      console.log("accounts: ", accounts);

      if (accounts.length > 0) {
        const account = accounts[0];
        console.log("wallet is connected! " + account);
      } else {
        console.log("make sure MetaMask is connected");
      }
    } catch (error) {
      console.log("error: ", error);
    }
  }

  const connectWallet = async () => {
    try {
      const {ethereum} = window;

      if (!ethereum) {
        console.log("please install MetaMask");
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts'
      });

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  }

  const buyDonut = async () => {
    try {
      const {ethereum} = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
        const buyMeADonut = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("buying donut..")
        const donutTxn = await buyMeADonut.buyDonut(
          name ? name : "anon",
          message ? message : "Enjoy your donut!",
          {value: ethers.utils.parseEther("0.001")}
        );

        await donutTxn.wait();

        console.log("mined ", donutTxn.hash);

        console.log("donut purchased!");

        // Clear the form fields.
        setName("");
        setMessage("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Function to fetch all memos stored on-chain.
  const getMemos = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const buyMeADonut = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        
        console.log("fetching memos from the blockchain..");
        const memos = await buyMeADonut.getMemos();
        console.log("fetched!");
        setMemos(memos);
      } else {
        console.log("Metamask is not connected");
      }
      
    } catch (error) {
      console.log(error);
    }
  };
  
  useEffect(() => {
    let buyMeADonut;
    isWalletConnected();
    getMemos();

    // Create an event handler function for when someone sends
    // us a new memo.
    const onNewMemo = (from, timestamp, name, message) => {
      console.log("Memo received: ", from, timestamp, name, message);
      setMemos((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message,
          name
        }
      ]);
    };

    const {ethereum} = window;

    // Listen for new memo events.
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum, "any");
      const signer = provider.getSigner();
      buyMeADonut = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      buyMeADonut.on("NewMemo", onNewMemo);
    }

    return () => {
      if (buyMeADonut) {
        buyMeADonut.off("NewMemo", onNewMemo);
      }
    }
  }, []);
  
  return (
    <div className={styles.container}>
      <Head>
        <title>Buy Me a Donut</title>
        <meta name="description" content="Tipping site" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          BUY ME A DONUT
        </h1>
        <p>
          (Contract deployed to Goerli test network)
        </p>
        
        {currentAccount ? (
          <div className={styles.formContainer}>
            <form>
              <div>
              
                <input
                  id="name"
                  type="text"
                  placeholder="Enter Name"
                  onChange={onNameChange}
                  />
              </div>
              <br/>
              <div>
                

                <textarea
                  rows={3}
                  placeholder="Enter a Message"
                  id="message"
                  onChange={onMessageChange}
                  required
                >
                </textarea>
              </div>
              <div>
                <button
                  type="button"
                  onClick={buyDonut}
                >
                  Send 1 Donut<br></br>(0.001ETH)
                </button>
              </div>
            </form>
          </div>
        ) : (
          <button onClick={connectWallet}> Connect Wallet </button>
        )}
      </main>

      {currentAccount && (<h1>Memos received:</h1>)}

      {currentAccount && (memos.map((memo, idx) => {
        return (
          <div key={idx} className={styles.memo_card}>
            <p style={{"fontWeight":"bold"}}>&ldquo;{memo.message}&rdquo;</p>
            <p>From: {memo.name} at {memo.timestamp.toString()}</p>
          </div>
        )
      }))}

      <footer className={styles.footer}>
        <p>
          Built by NFT Donut using Solidity, Ethers.js, and Next.js
        </p>
      </footer>
    </div>
  )
}
