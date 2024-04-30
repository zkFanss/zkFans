"use client";

import { useEffect, useState } from "react";
import { publicClient } from "../../contracts/client";
import type { NextPage } from "next";
import { getAddress, getContract } from "viem";
import deployedContracts from "~~/contracts/deployedContracts";

const contract = getContract({
  address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "",
  abi: deployedContracts[31337].zkFansContract.abi,
  client: publicClient,
});

const Profile: NextPage = () => {
  const [userName, setUserName] = useState<string>("");
  //TODO
  const checkSumAddress = getAddress("0x2aE609F58263D749B27120C108C72d24f7e8C95B");
  useEffect(() => {
    contract.read.getProfileUserName([checkSumAddress]).then(result => {
      setUserName(result);
    });
  }, []);

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">{userName} profile</h1>
          <div className="flex justify-center items-center space-x-2"></div>
        </div>
      </div>
    </>
  );
};

export default Profile;
