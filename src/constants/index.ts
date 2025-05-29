export const FEEDBACK_PAYMENT_ABI = [
    {
        "type": "constructor",
        "inputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "fallback",
        "stateMutability": "payable"
    },
    {
        "type": "receive",
        "stateMutability": "payable"
    },
    {
        "type": "function",
        "name": "hasPaid",
        "inputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "bool",
                "internalType": "bool"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "pay",
        "inputs": [],
        "outputs": [],
        "stateMutability": "payable"
    },
    {
        "type": "function",
        "name": "withdraw",
        "inputs": [],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "error",
        "name": "IncorrectAmount",
        "inputs": []
    },
    {
        "type": "error",
        "name": "NotOwner",
        "inputs": []
    }
]

export const LOCAL_FEEDBACK_PAYMENT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
export const MEGA_FEEDBACK_PAYMENT_ADDRESS = "0x4e6CD23224B1229e10c7BC2992C70Fc5f9508af4"

