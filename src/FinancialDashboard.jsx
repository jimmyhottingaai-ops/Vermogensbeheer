import { useState, useEffect, useRef } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar, XAxis as BXAxis, YAxis as BYAxis
} from "recharts";

// ─── GOOGLE FONTS ───────────────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=DM+Mono:wght@300;400&display=swap";
document.head.appendChild(fontLink);

// ─── DESIGN TOKENS ──────────────────────────────────────────────────────────
const C = {
  bg:       "#0A0A0B",
  surface:  "#111114",
  card:     "#16161A",
  border:   "#242428",
  borderHi: "#2E2E34",
  gold:     "#C9A84C",
  goldDim:  "#8A6D2F",
  goldGlow: "rgba(201,168,76,0.12)",
  text:     "#E8E4DC",
  textDim:  "#7A776E",
  textMid:  "#ABA79E",
  green:    "#4CAF7A",
  red:      "#C96B4C",
};

const PIE_COLORS = ["#C9A84C", "#4C7AC9", "#4CAF7A", "#C96B4C"];

// ─── PORTFOLIO DATA ──────────────────────────────────────────────────────────
const PORTFOLIO = {
  stocks: [
    { id: "vwrl", name: "Vanguard FTSE All-World", ticker: "VWRL", quantity: 420, avg_buy: 98.5,  mock_price: 118.42, currency: "EUR" },
    { id: "aapl", name: "Apple Inc.",              ticker: "AAPL", quantity: 40,  avg_buy: 165.0,  mock_price: 213.50, currency: "USD" },
    { id: "msft", name: "Microsoft Corp.",         ticker: "MSFT", quantity: 28,  avg_buy: 290.0,  mock_price: 415.20, currency: "USD" },
    { id: "iwda", name: "iShares Core MSCI World", ticker: "IWDA", quantity: 380, avg_buy: 72.10,  mock_price: 89.35,  currency: "EUR" },
  ],
  real_estate: [
    { id: "re1", name: "Woning Amsterdam", value: 450000, mortgage: 280000, currency: "EUR" },
  ],
  precious_metals: [
    { id: "xau", name: "Goud",   metal: "XAU", quantity: 500,  unit: "gram", mock_price_per_gram: 61.20, currency: "EUR" },
    { id: "xag", name: "Zilver", metal: "XAG", quantity: 2000, unit: "gram", mock_price_per_gram: 0.84,  currency: "EUR" },
  ],
  savings: [
    { id: "sav1", name: "Spaarrekening ING",  balance: 85000,  rate: 2.5, type: "savings_account", currency: "EUR" },
    { id: "sav2", name: "Deposito Rabobank",  balance: 40000,  rate: 3.1, type: "term_deposit",    currency: "EUR", start_date: "2024-01-01", end_date: "2026-01-01" },
  ],
};

const USD_EUR = 0.921;

// ─── ETF / AANDELEN DATABASE ──────────────────────────────────────────────────
// Regio-gewichten per fonds (gebaseerd op echte fondsdata, periodiek bijwerken)
// type: "etf" | "stock" | "index"   currency: "EUR" | "USD" | "GBP"
const ETF_REGIONS = {
  // ── GLOBAL ALL-WORLD ─────────────────────────────────────────────────────
  "VWRL": { name: "Vanguard FTSE All-World (USD)", type: "etf", currency: "USD", color: "#C9A84C",
    regions: { "Noord-Amerika": 63.2, "Europa": 16.8, "Azië-Pacific": 13.4, "Japan": 5.2, "Opkomende markten": 0.8, "Overig": 0.6 } },
  "VWCE": { name: "Vanguard FTSE All-World UCITS (EUR acc)", type: "etf", currency: "EUR", color: "#C9A84C",
    regions: { "Noord-Amerika": 63.2, "Europa": 16.8, "Azië-Pacific": 13.4, "Japan": 5.2, "Opkomende markten": 0.8, "Overig": 0.6 } },
  "SSAC": { name: "iShares MSCI ACWI UCITS ETF", type: "etf", currency: "USD", color: "#C9A84C",
    regions: { "Noord-Amerika": 64.1, "Europa": 14.9, "Azië-Pacific": 11.8, "Japan": 5.4, "Opkomende markten": 3.2, "Overig": 0.6 } },
  "ACWI": { name: "iShares MSCI ACWI ETF", type: "etf", currency: "USD", color: "#C9A84C",
    regions: { "Noord-Amerika": 64.1, "Europa": 14.9, "Azië-Pacific": 11.8, "Japan": 5.4, "Opkomende markten": 3.2, "Overig": 0.6 } },
  "SPYY": { name: "SPDR MSCI ACWI UCITS ETF", type: "etf", currency: "EUR", color: "#C9A84C",
    regions: { "Noord-Amerika": 63.8, "Europa": 15.2, "Azië-Pacific": 12.0, "Japan": 5.3, "Opkomende markten": 3.1, "Overig": 0.6 } },

  // ── MSCI WORLD (ontwikkeld) ───────────────────────────────────────────────
  "IWDA": { name: "iShares Core MSCI World UCITS ETF", type: "etf", currency: "USD", color: "#4C7AC9",
    regions: { "Noord-Amerika": 71.4, "Europa": 18.9, "Azië-Pacific": 6.8, "Japan": 5.5, "Opkomende markten": 0.0, "Overig": 0.0 } },
  "SWDA": { name: "iShares Core MSCI World UCITS (GBP)", type: "etf", currency: "GBP", color: "#4C7AC9",
    regions: { "Noord-Amerika": 71.4, "Europa": 18.9, "Azië-Pacific": 6.8, "Japan": 5.5, "Opkomende markten": 0.0, "Overig": 0.0 } },
  "EXSA": { name: "iShares Core MSCI World UCITS (EUR)", type: "etf", currency: "EUR", color: "#4C7AC9",
    regions: { "Noord-Amerika": 71.4, "Europa": 18.9, "Azië-Pacific": 6.8, "Japan": 5.5, "Opkomende markten": 0.0, "Overig": 0.0 } },
  "URTH": { name: "iShares MSCI World ETF (USD)", type: "etf", currency: "USD", color: "#4C7AC9",
    regions: { "Noord-Amerika": 71.4, "Europa": 18.9, "Azië-Pacific": 6.8, "Japan": 5.5, "Opkomende markten": 0.0, "Overig": 0.0 } },
  "VT":   { name: "Vanguard Total World Stock ETF", type: "etf", currency: "USD", color: "#4C7AC9",
    regions: { "Noord-Amerika": 62.5, "Europa": 16.2, "Azië-Pacific": 13.8, "Japan": 5.6, "Opkomende markten": 1.3, "Overig": 0.6 } },
  "VTI":  { name: "Vanguard Total Stock Market ETF", type: "etf", currency: "USD", color: "#4C7AC9",
    regions: { "Noord-Amerika": 100.0, "Europa": 0.0, "Azië-Pacific": 0.0, "Japan": 0.0, "Opkomende markten": 0.0, "Overig": 0.0 } },
  "XDWD": { name: "Xtrackers MSCI World Swap UCITS ETF", type: "etf", currency: "EUR", color: "#4C7AC9",
    regions: { "Noord-Amerika": 71.4, "Europa": 18.9, "Azië-Pacific": 6.8, "Japan": 5.5, "Opkomende markten": 0.0, "Overig": 0.0 } },
  "LCWD": { name: "iShares MSCI World ESG Screened UCITS", type: "etf", currency: "EUR", color: "#4C7AC9",
    regions: { "Noord-Amerika": 70.8, "Europa": 19.3, "Azië-Pacific": 6.5, "Japan": 5.2, "Opkomende markten": 0.0, "Overig": 0.0 } },
  "IUSN": { name: "iShares MSCI World Small Cap UCITS ETF", type: "etf", currency: "EUR", color: "#4C7AC9",
    regions: { "Noord-Amerika": 58.5, "Europa": 20.2, "Azië-Pacific": 9.8, "Japan": 10.1, "Opkomende markten": 0.0, "Overig": 1.4 } },

  // ── S&P 500 ───────────────────────────────────────────────────────────────
  "SPY":  { name: "SPDR S&P 500 ETF Trust", type: "etf", currency: "USD", color: "#C96B4C",
    regions: { "Noord-Amerika": 100.0, "Europa": 0.0, "Azië-Pacific": 0.0, "Japan": 0.0, "Opkomende markten": 0.0, "Overig": 0.0 } },
  "VOO":  { name: "Vanguard S&P 500 ETF", type: "etf", currency: "USD", color: "#C96B4C",
    regions: { "Noord-Amerika": 100.0, "Europa": 0.0, "Azië-Pacific": 0.0, "Japan": 0.0, "Opkomende markten": 0.0, "Overig": 0.0 } },
  "IVV":  { name: "iShares Core S&P 500 ETF", type: "etf", currency: "USD", color: "#C96B4C",
    regions: { "Noord-Amerika": 100.0, "Europa": 0.0, "Azië-Pacific": 0.0, "Japan": 0.0, "Opkomende markten": 0.0, "Overig": 0.0 } },
  "CSPX": { name: "iShares Core S&P 500 UCITS ETF (USD)", type: "etf", currency: "USD", color: "#C96B4C",
    regions: { "Noord-Amerika": 100.0, "Europa": 0.0, "Azië-Pacific": 0.0, "Japan": 0.0, "Opkomende markten": 0.0, "Overig": 0.0 } },
  "SXR8": { name: "iShares Core S&P 500 UCITS ETF (EUR)", type: "etf", currency: "EUR", color: "#C96B4C",
    regions: { "Noord-Amerika": 100.0, "Europa": 0.0, "Azië-Pacific": 0.0, "Japan": 0.0, "Opkomende markten": 0.0, "Overig": 0.0 } },
  "VUAA": { name: "Vanguard S&P 500 UCITS ETF (EUR acc)", type: "etf", currency: "EUR", color: "#C96B4C",
    regions: { "Noord-Amerika": 100.0, "Europa": 0.0, "Azië-Pacific": 0.0, "Japan": 0.0, "Opkomende markten": 0.0, "Overig": 0.0 } },
  "XSPX": { name: "Xtrackers S&P 500 Swap UCITS ETF", type: "etf", currency: "EUR", color: "#C96B4C",
    regions: { "Noord-Amerika": 100.0, "Europa": 0.0, "Azië-Pacific": 0.0, "Japan": 0.0, "Opkomende markten": 0.0, "Overig": 0.0 } },
  "500":  { name: "Amundi S&P 500 UCITS ETF", type: "etf", currency: "EUR", color: "#C96B4C",
    regions: { "Noord-Amerika": 100.0, "Europa": 0.0, "Azië-Pacific": 0.0, "Japan": 0.0, "Opkomende markten": 0.0, "Overig": 0.0 } },

  // ── NASDAQ / TECH ─────────────────────────────────────────────────────────
  "QQQ":  { name: "Invesco QQQ Trust (Nasdaq-100)", type: "etf", currency: "USD", color: "#9B6FC9",
    regions: { "Noord-Amerika": 96.5, "Europa": 1.5, "Azië-Pacific": 1.5, "Japan": 0.0, "Opkomende markten": 0.5, "Overig": 0.0 } },
  "EQQQ": { name: "Invesco EQQQ Nasdaq-100 UCITS ETF", type: "etf", currency: "EUR", color: "#9B6FC9",
    regions: { "Noord-Amerika": 96.5, "Europa": 1.5, "Azië-Pacific": 1.5, "Japan": 0.0, "Opkomende markten": 0.5, "Overig": 0.0 } },
  "CNDX": { name: "iShares Nasdaq 100 UCITS ETF (USD)", type: "etf", currency: "USD", color: "#9B6FC9",
    regions: { "Noord-Amerika": 96.5, "Europa": 1.5, "Azië-Pacific": 1.5, "Japan": 0.0, "Opkomende markten": 0.5, "Overig": 0.0 } },
  "QDVE": { name: "iShares S&P 500 IT Sector UCITS ETF", type: "etf", currency: "EUR", color: "#9B6FC9",
    regions: { "Noord-Amerika": 98.5, "Europa": 0.5, "Azië-Pacific": 0.5, "Japan": 0.0, "Opkomende markten": 0.5, "Overig": 0.0 } },
  "VIGI": { name: "Vanguard International Dividend Appreciation", type: "etf", currency: "USD", color: "#9B6FC9",
    regions: { "Noord-Amerika": 40.2, "Europa": 25.8, "Azië-Pacific": 18.5, "Japan": 12.3, "Opkomende markten": 2.0, "Overig": 1.2 } },

  // ── EUROPA ────────────────────────────────────────────────────────────────
  "IEUR": { name: "iShares Core MSCI Europe UCITS ETF", type: "etf", currency: "EUR", color: "#4CAF7A",
    regions: { "Noord-Amerika": 0.0, "Europa": 100.0, "Azië-Pacific": 0.0, "Japan": 0.0, "Opkomende markten": 0.0, "Overig": 0.0 } },
  "VGK":  { name: "Vanguard FTSE Europe ETF", type: "etf", currency: "USD", color: "#4CAF7A",
    regions: { "Noord-Amerika": 0.0, "Europa": 100.0, "Azië-Pacific": 0.0, "Japan": 0.0, "Opkomende markten": 0.0, "Overig": 0.0 } },
  "STOXX":{ name: "Amundi EURO STOXX 50 UCITS ETF", type: "etf", currency: "EUR", color: "#4CAF7A",
    regions: { "Noord-Amerika": 0.0, "Europa": 100.0, "Azië-Pacific": 0.0, "Japan": 0.0, "Opkomende markten": 0.0, "Overig": 0.0 } },
  "EXW1": { name: "iShares Core DAX UCITS ETF", type: "etf", currency: "EUR", color: "#4CAF7A",
    regions: { "Noord-Amerika": 0.0, "Europa": 100.0, "Azië-Pacific": 0.0, "Japan": 0.0, "Opkomende markten": 0.0, "Overig": 0.0 } },
  "MEUD": { name: "Lyxor MSCI EMU UCITS ETF", type: "etf", currency: "EUR", color: "#4CAF7A",
    regions: { "Noord-Amerika": 0.0, "Europa": 100.0, "Azië-Pacific": 0.0, "Japan": 0.0, "Opkomende markten": 0.0, "Overig": 0.0 } },

  // ── OPKOMENDE MARKTEN ─────────────────────────────────────────────────────
  "IEMG": { name: "iShares Core MSCI Emerging Markets ETF", type: "etf", currency: "USD", color: "#C96B4C",
    regions: { "Noord-Amerika": 0.0, "Europa": 2.8, "Azië-Pacific": 42.5, "Japan": 0.0, "Opkomende markten": 54.7, "Overig": 0.0 } },
  "EEM":  { name: "iShares MSCI Emerging Markets ETF", type: "etf", currency: "USD", color: "#C96B4C",
    regions: { "Noord-Amerika": 0.0, "Europa": 2.8, "Azië-Pacific": 42.5, "Japan": 0.0, "Opkomende markten": 54.7, "Overig": 0.0 } },
  "EIMI": { name: "iShares Core MSCI EM IMI UCITS ETF", type: "etf", currency: "USD", color: "#C96B4C",
    regions: { "Noord-Amerika": 0.0, "Europa": 2.5, "Azië-Pacific": 43.0, "Japan": 0.0, "Opkomende markten": 54.5, "Overig": 0.0 } },
  "VFEM": { name: "Vanguard FTSE Emerging Markets UCITS ETF", type: "etf", currency: "USD", color: "#C96B4C",
    regions: { "Noord-Amerika": 0.0, "Europa": 2.0, "Azië-Pacific": 44.0, "Japan": 0.0, "Opkomende markten": 54.0, "Overig": 0.0 } },
  "EMIM": { name: "iShares MSCI EM IMI UCITS ETF (EUR)", type: "etf", currency: "EUR", color: "#C96B4C",
    regions: { "Noord-Amerika": 0.0, "Europa": 2.5, "Azië-Pacific": 43.0, "Japan": 0.0, "Opkomende markten": 54.5, "Overig": 0.0 } },

  // ── AZIË & JAPAN ──────────────────────────────────────────────────────────
  "IAEX": { name: "iShares MSCI Japan UCITS ETF", type: "etf", currency: "USD", color: "#9B6FC9",
    regions: { "Noord-Amerika": 0.0, "Europa": 0.0, "Azië-Pacific": 0.0, "Japan": 100.0, "Opkomende markten": 0.0, "Overig": 0.0 } },
  "EWJ":  { name: "iShares MSCI Japan ETF", type: "etf", currency: "USD", color: "#9B6FC9",
    regions: { "Noord-Amerika": 0.0, "Europa": 0.0, "Azië-Pacific": 0.0, "Japan": 100.0, "Opkomende markten": 0.0, "Overig": 0.0 } },
  "XMUJ": { name: "Xtrackers MSCI Japan UCITS ETF", type: "etf", currency: "EUR", color: "#9B6FC9",
    regions: { "Noord-Amerika": 0.0, "Europa": 0.0, "Azië-Pacific": 0.0, "Japan": 100.0, "Opkomende markten": 0.0, "Overig": 0.0 } },
  "PAASI":{ name: "iShares MSCI AC Far East ex-JP UCITS", type: "etf", currency: "USD", color: "#9B6FC9",
    regions: { "Noord-Amerika": 0.0, "Europa": 0.0, "Azië-Pacific": 65.0, "Japan": 0.0, "Opkomende markten": 35.0, "Overig": 0.0 } },

  // ── DIVIDENDSTRATEGIEËN ───────────────────────────────────────────────────
  "VHYL": { name: "Vanguard FTSE All-World High Dividend Yield", type: "etf", currency: "USD", color: "#C9A84C",
    regions: { "Noord-Amerika": 40.5, "Europa": 26.2, "Azië-Pacific": 15.8, "Japan": 10.3, "Opkomende markten": 5.8, "Overig": 1.4 } },
  "TDIV": { name: "VanEck Sustainable World Equal Weight UCITS", type: "etf", currency: "EUR", color: "#C9A84C",
    regions: { "Noord-Amerika": 45.2, "Europa": 30.8, "Azië-Pacific": 12.5, "Japan": 8.3, "Opkomende markten": 2.2, "Overig": 1.0 } },
  "IDVY": { name: "iShares Euro Dividend UCITS ETF", type: "etf", currency: "EUR", color: "#C9A84C",
    regions: { "Noord-Amerika": 0.0, "Europa": 100.0, "Azië-Pacific": 0.0, "Japan": 0.0, "Opkomende markten": 0.0, "Overig": 0.0 } },
  "DVYA": { name: "iShares Asia Pacific Dividend UCITS ETF", type: "etf", currency: "USD", color: "#C9A84C",
    regions: { "Noord-Amerika": 0.0, "Europa": 0.0, "Azië-Pacific": 65.0, "Japan": 20.0, "Opkomende markten": 15.0, "Overig": 0.0 } },

  // ── ESG / DUURZAAM ────────────────────────────────────────────────────────
  "SUSW": { name: "iShares MSCI World SRI UCITS ETF", type: "etf", currency: "EUR", color: "#4CAF7A",
    regions: { "Noord-Amerika": 65.2, "Europa": 22.4, "Azië-Pacific": 7.0, "Japan": 4.8, "Opkomende markten": 0.0, "Overig": 0.6 } },
  "SUDI": { name: "iShares MSCI World ESG Screened UCITS", type: "etf", currency: "USD", color: "#4CAF7A",
    regions: { "Noord-Amerika": 70.8, "Europa": 19.3, "Azië-Pacific": 6.5, "Japan": 5.2, "Opkomende markten": 0.0, "Overig": 0.0 } },
  "MVOL": { name: "iShares Edge MSCI World Min Vol UCITS", type: "etf", currency: "EUR", color: "#4CAF7A",
    regions: { "Noord-Amerika": 60.5, "Europa": 22.1, "Azië-Pacific": 9.8, "Japan": 7.1, "Opkomende markten": 0.0, "Overig": 0.5 } },

  // ── SECTOR ETFs ───────────────────────────────────────────────────────────
  "XLK":  { name: "Technology Select Sector SPDR Fund", type: "etf", currency: "USD", color: "#9B6FC9",
    regions: { "Noord-Amerika": 100.0, "Europa": 0.0, "Azië-Pacific": 0.0, "Japan": 0.0, "Opkomende markten": 0.0, "Overig": 0.0 } },
  "XLV":  { name: "Health Care Select Sector SPDR Fund", type: "etf", currency: "USD", color: "#9B6FC9",
    regions: { "Noord-Amerika": 100.0, "Europa": 0.0, "Azië-Pacific": 0.0, "Japan": 0.0, "Opkomende markten": 0.0, "Overig": 0.0 } },
  "XLF":  { name: "Financial Select Sector SPDR Fund", type: "etf", currency: "USD", color: "#9B6FC9",
    regions: { "Noord-Amerika": 100.0, "Europa": 0.0, "Azië-Pacific": 0.0, "Japan": 0.0, "Opkomende markten": 0.0, "Overig": 0.0 } },
  "IQQH": { name: "iShares Global Clean Energy UCITS ETF", type: "etf", currency: "USD", color: "#4CAF7A",
    regions: { "Noord-Amerika": 50.2, "Europa": 28.5, "Azië-Pacific": 12.8, "Japan": 3.5, "Opkomende markten": 5.0, "Overig": 0.0 } },
  "WHAP": { name: "iShares Automation & Robotics UCITS ETF", type: "etf", currency: "USD", color: "#4CAF7A",
    regions: { "Noord-Amerika": 42.5, "Europa": 20.0, "Azië-Pacific": 15.0, "Japan": 18.5, "Opkomende markten": 4.0, "Overig": 0.0 } },

  // ── OBLIGATIES ────────────────────────────────────────────────────────────
  "AGGH": { name: "iShares Core Global Agg Bond UCITS ETF", type: "etf", currency: "EUR", color: "#4A4A52",
    regions: { "Noord-Amerika": 45.2, "Europa": 30.8, "Azië-Pacific": 12.5, "Japan": 8.5, "Opkomende markten": 3.0, "Overig": 0.0 } },
  "VAGS": { name: "Vanguard Global Agg Bond UCITS ETF", type: "etf", currency: "EUR", color: "#4A4A52",
    regions: { "Noord-Amerika": 44.8, "Europa": 31.2, "Azië-Pacific": 12.8, "Japan": 8.2, "Opkomende markten": 3.0, "Overig": 0.0 } },
  "IBTS": { name: "iShares $ Treasury Bond 1-3yr UCITS ETF", type: "etf", currency: "USD", color: "#4A4A52",
    regions: { "Noord-Amerika": 100.0, "Europa": 0.0, "Azië-Pacific": 0.0, "Japan": 0.0, "Opkomende markten": 0.0, "Overig": 0.0 } },

  // ── GROTE INDIVIDUELE AANDELEN (US) ───────────────────────────────────────
  "AAPL": { name: "Apple Inc.", type: "stock", currency: "USD", color: "#C9A84C",
    regions: { "Noord-Amerika": 100, "Europa": 0, "Azië-Pacific": 0, "Japan": 0, "Opkomende markten": 0, "Overig": 0 } },
  "MSFT": { name: "Microsoft Corporation", type: "stock", currency: "USD", color: "#4C7AC9",
    regions: { "Noord-Amerika": 100, "Europa": 0, "Azië-Pacific": 0, "Japan": 0, "Opkomende markten": 0, "Overig": 0 } },
  "NVDA": { name: "NVIDIA Corporation", type: "stock", currency: "USD", color: "#4CAF7A",
    regions: { "Noord-Amerika": 100, "Europa": 0, "Azië-Pacific": 0, "Japan": 0, "Opkomende markten": 0, "Overig": 0 } },
  "AMZN": { name: "Amazon.com Inc.", type: "stock", currency: "USD", color: "#C96B4C",
    regions: { "Noord-Amerika": 100, "Europa": 0, "Azië-Pacific": 0, "Japan": 0, "Opkomende markten": 0, "Overig": 0 } },
  "GOOGL":{ name: "Alphabet Inc. (Class A)", type: "stock", currency: "USD", color: "#9B6FC9",
    regions: { "Noord-Amerika": 100, "Europa": 0, "Azië-Pacific": 0, "Japan": 0, "Opkomende markten": 0, "Overig": 0 } },
  "META": { name: "Meta Platforms Inc.", type: "stock", currency: "USD", color: "#4C7AC9",
    regions: { "Noord-Amerika": 100, "Europa": 0, "Azië-Pacific": 0, "Japan": 0, "Opkomende markten": 0, "Overig": 0 } },
  "TSLA": { name: "Tesla Inc.", type: "stock", currency: "USD", color: "#C9A84C",
    regions: { "Noord-Amerika": 100, "Europa": 0, "Azië-Pacific": 0, "Japan": 0, "Opkomende markten": 0, "Overig": 0 } },
  "BRK.B":{ name: "Berkshire Hathaway Class B", type: "stock", currency: "USD", color: "#4CAF7A",
    regions: { "Noord-Amerika": 100, "Europa": 0, "Azië-Pacific": 0, "Japan": 0, "Opkomende markten": 0, "Overig": 0 } },
  "JPM":  { name: "JPMorgan Chase & Co.", type: "stock", currency: "USD", color: "#C96B4C",
    regions: { "Noord-Amerika": 100, "Europa": 0, "Azië-Pacific": 0, "Japan": 0, "Opkomende markten": 0, "Overig": 0 } },
  "V":    { name: "Visa Inc.", type: "stock", currency: "USD", color: "#9B6FC9",
    regions: { "Noord-Amerika": 100, "Europa": 0, "Azië-Pacific": 0, "Japan": 0, "Opkomende markten": 0, "Overig": 0 } },

  // ── GROTE INDIVIDUELE AANDELEN (EU) ───────────────────────────────────────
  "ASML": { name: "ASML Holding N.V.", type: "stock", currency: "EUR", color: "#4CAF7A",
    regions: { "Noord-Amerika": 0, "Europa": 100, "Azië-Pacific": 0, "Japan": 0, "Opkomende markten": 0, "Overig": 0 } },
  "SAP":  { name: "SAP SE", type: "stock", currency: "EUR", color: "#4C7AC9",
    regions: { "Noord-Amerika": 0, "Europa": 100, "Azië-Pacific": 0, "Japan": 0, "Opkomende markten": 0, "Overig": 0 } },
  "LVMH": { name: "LVMH Moët Hennessy Louis Vuitton", type: "stock", currency: "EUR", color: "#C9A84C",
    regions: { "Noord-Amerika": 0, "Europa": 100, "Azië-Pacific": 0, "Japan": 0, "Opkomende markten": 0, "Overig": 0 } },
  "NOVO": { name: "Novo Nordisk A/S", type: "stock", currency: "EUR", color: "#C96B4C",
    regions: { "Noord-Amerika": 0, "Europa": 100, "Azië-Pacific": 0, "Japan": 0, "Opkomende markten": 0, "Overig": 0 } },
  "SIE":  { name: "Siemens AG", type: "stock", currency: "EUR", color: "#9B6FC9",
    regions: { "Noord-Amerika": 0, "Europa": 100, "Azië-Pacific": 0, "Japan": 0, "Opkomende markten": 0, "Overig": 0 } },
  "SHELL":{ name: "Shell plc", type: "stock", currency: "EUR", color: "#4CAF7A",
    regions: { "Noord-Amerika": 0, "Europa": 100, "Azië-Pacific": 0, "Japan": 0, "Opkomende markten": 0, "Overig": 0 } },
  "AMS":  { name: "Amsterdam Exchange (AEX) constituents", type: "stock", currency: "EUR", color: "#4C7AC9",
    regions: { "Noord-Amerika": 0, "Europa": 100, "Azië-Pacific": 0, "Japan": 0, "Opkomende markten": 0, "Overig": 0 } },
};

// Gesorteerde lijst voor dropdown
const ETF_LIST = Object.entries(ETF_REGIONS)
  .map(([ticker, d]) => ({ ticker, name: d.name, type: d.type, currency: d.currency, color: d.color }))
  .sort((a, b) => a.ticker.localeCompare(b.ticker));

const REGION_COLORS = {
  "Noord-Amerika":      "#C9A84C",
  "Europa":             "#4C7AC9",
  "Azië-Pacific":       "#4CAF7A",
  "Japan":              "#9B6FC9",
  "Opkomende markten":  "#C96B4C",
  "Overig":             "#4A4A52",
};

// Bereken gewogen regiomix over hele aandelenportefeuille
function calcWorldDistribution(positions) {
  const totalValue = positions.reduce((s, p) => s + p.value, 0);
  const regionTotals = {};

  positions.forEach(p => {
    const etfData = ETF_REGIONS[p.ticker];
    if (!etfData) return;
    const weight = p.value / totalValue;
    Object.entries(etfData.regions).forEach(([region, pct]) => {
      regionTotals[region] = (regionTotals[region] || 0) + (pct * weight);
    });
  });

  return Object.entries(regionTotals)
    .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(1)), color: REGION_COLORS[name] }))
    .filter(r => r.value > 0)
    .sort((a, b) => b.value - a.value);
}

// HISTORY wordt dynamisch opgebouwd vanuit logboek snapshots

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt = (n, dec = 0) =>
  new Intl.NumberFormat("nl-NL", { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(n);

const fmtEur = (n) =>
  "€ " + fmt(Math.abs(n));

// ─── SUBCOMPONENTS ───────────────────────────────────────────────────────────

// Autocomplete zoekbalk voor ETF/aandeel selectie
function TickerSearch({ value, onChange, onSelect, placeholder = "Zoek op ticker of naam…" }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value || "");
  const ref = useRef(null);

  // Sluit bij klik buiten
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = query.length < 1 ? ETF_LIST.slice(0, 12) :
    ETF_LIST.filter(e =>
      e.ticker.toLowerCase().includes(query.toLowerCase()) ||
      e.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 15);

  const typeLabel = { etf: "ETF", stock: "AANDEEL", index: "INDEX" };
  const typeColor = { etf: C.gold, stock: C.green, index: C.textMid };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <input
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); onChange(e.target.value); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        style={{ ...inputStyle, borderColor: open ? C.gold + "60" : C.border }}
      />
      {open && filtered.length > 0 && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 999,
          background: C.card, border: `1px solid ${C.gold}40`,
          borderTop: "none", maxHeight: 280, overflowY: "auto",
          boxShadow: `0 8px 32px rgba(0,0,0,0.6)`,
        }}>
          {filtered.map(e => (
            <div key={e.ticker}
              onMouseDown={() => { onSelect(e); setQuery(e.ticker); setOpen(false); }}
              style={{
                padding: "10px 14px", cursor: "pointer", display: "flex",
                alignItems: "center", gap: 10, borderBottom: `1px solid ${C.border}20`,
                transition: "background 0.1s",
              }}
              onMouseEnter={el => el.currentTarget.style.background = C.goldGlow}
              onMouseLeave={el => el.currentTarget.style.background = "transparent"}
            >
              <span style={{
                fontFamily: "'DM Mono'", fontSize: 11, color: e.color || C.gold,
                minWidth: 52, letterSpacing: "0.05em",
              }}>{e.ticker}</span>
              <span style={{ fontSize: 11, color: C.textMid, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {e.name}
              </span>
              <span style={{ fontSize: 8, color: typeColor[e.type] || C.textDim, letterSpacing: "0.12em", minWidth: 46, textAlign: "right" }}>
                {typeLabel[e.type] || e.type?.toUpperCase()}
              </span>
              <span style={{ fontSize: 9, color: C.textDim, minWidth: 28 }}>{e.currency}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Custom SVG donut — altijd leesbaar, labels buiten kleine segmenten
function AllocationDonut({ data, colors, total }) {
  const [hovered, setHovered] = useState(null);
  const cx = 110, cy = 110, R = 82, r = 54;
  const gap = 0.018; // radians gap tussen segmenten

  // Bereken hoeken
  const totalVal = data.reduce((s, d) => s + d.value, 0);
  let cursor = -Math.PI / 2;
  const slices = data.map((d, i) => {
    const angle = (d.value / totalVal) * (2 * Math.PI) - gap;
    const start = cursor + gap / 2;
    const end = start + angle;
    cursor += (d.value / totalVal) * (2 * Math.PI);
    const midAngle = (start + end) / 2;
    return { ...d, start, end, midAngle, color: colors[i] };
  });

  const arc = (cx, cy, R, r, start, end, color, isHovered) => {
    const x1 = cx + R * Math.cos(start), y1 = cy + R * Math.sin(start);
    const x2 = cx + R * Math.cos(end),   y2 = cy + R * Math.sin(end);
    const x3 = cx + r * Math.cos(end),   y3 = cy + r * Math.sin(end);
    const x4 = cx + r * Math.cos(start), y4 = cy + r * Math.sin(start);
    const large = end - start > Math.PI ? 1 : 0;
    const scale = isHovered ? 1.04 : 1;
    return (
      <path
        d={`M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${r} ${r} 0 ${large} 0 ${x4} ${y4} Z`}
        fill={color}
        opacity={isHovered ? 1 : hovered === null ? 0.88 : 0.45}
        stroke={C.bg} strokeWidth="1.5"
        style={{ transition: "opacity 0.2s, transform 0.2s", transformOrigin: `${cx}px ${cy}px`, transform: `scale(${scale})`, cursor: "pointer" }}
      />
    );
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* SVG donut */}
        <svg width="220" height="220" viewBox="0 0 220 220" style={{ flexShrink: 0 }}>
          {slices.map((s, i) => (
            <g key={s.name}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {arc(cx, cy, R, r, s.start, s.end, s.color, hovered === i)}
            </g>
          ))}
          {/* Center text */}
          <text x={cx} y={cy - 10} textAnchor="middle"
            style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, fill: C.textDim, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            {hovered !== null ? slices[hovered].name.split(" ")[0].toUpperCase() : "TOTAAL"}
          </text>
          <text x={cx} y={cy + 10} textAnchor="middle"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 300, fill: hovered !== null ? slices[hovered].color : C.gold }}>
            {hovered !== null
              ? slices[hovered].pct + "%"
              : "€ " + (total / 1000).toFixed(0) + "k"}
          </text>
          {hovered !== null && (
            <text x={cx} y={cy + 26} textAnchor="middle"
              style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, fill: C.textMid }}>
              € {new Intl.NumberFormat("nl-NL").format(Math.round(slices[hovered].value))}
            </text>
          )}
        </svg>

        {/* Legenda rechts */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
          {slices.map((s, i) => (
            <div key={s.name}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "pointer", opacity: hovered === null || hovered === i ? 1 : 0.5, transition: "opacity 0.2s" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{ width: 7, height: 7, background: s.color, flexShrink: 0 }} />
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.textDim, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    {s.name}
                  </span>
                </div>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, color: s.color, fontWeight: 300 }}>
                  {s.pct}%
                </span>
              </div>
              <div style={{ height: 2, background: C.border, borderRadius: 1 }}>
                <div style={{
                  height: "100%", width: `${s.pct}%`, background: s.color, borderRadius: 1,
                  transition: "width 0.8s ease",
                  boxShadow: hovered === i ? `0 0 8px ${s.color}80` : "none"
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GoldDivider() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "0 0 24px" }}>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${C.gold})` }} />
      <div style={{ width: 4, height: 4, background: C.gold, transform: "rotate(45deg)" }} />
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${C.gold}, transparent)` }} />
    </div>
  );
}

function KPICard({ label, value, sub, trend }) {
  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderTop: `1px solid ${C.gold}40`,
      padding: "24px 28px",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg, transparent, ${C.gold}60, transparent)`
      }} />
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: "0.15em", color: C.textDim, textTransform: "uppercase", marginBottom: 10 }}>
        {label}
      </div>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 300, color: C.text, lineHeight: 1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: trend === "up" ? C.green : trend === "down" ? C.red : C.textDim, marginTop: 8 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.borderHi}`,
      padding: "10px 16px", fontFamily: "'DM Mono', monospace", fontSize: 11
    }}>
      <div style={{ color: C.textDim, marginBottom: 4 }}>{label}</div>
      <div style={{ color: C.gold }}>€ {fmt(payload[0].value)}</div>
    </div>
  );
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.borderHi}`,
      padding: "10px 16px", fontFamily: "'DM Mono', monospace", fontSize: 11
    }}>
      <div style={{ color: C.textDim }}>{payload[0].name}</div>
      <div style={{ color: C.gold }}>€ {fmt(payload[0].value)} · {payload[0].payload.pct}%</div>
    </div>
  );
}

// ─── CRUD MODAL ──────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
      backdropFilter: "blur(4px)",
    }} onClick={onClose}>
      <div style={{
        background: C.card, border: `1px solid ${C.borderHi}`,
        borderTop: `2px solid ${C.gold}`, width: 520, maxWidth: "95vw",
        padding: "32px", position: "relative",
        boxShadow: `0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px ${C.border}`,
        maxHeight: "90vh", overflowY: "auto",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 300, color: C.text }}>
            {title}
          </div>
          <div onClick={onClose} style={{ cursor: "pointer", color: C.textDim, fontSize: 18, lineHeight: 1, padding: "4px 8px" }}>✕</div>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: C.textDim, marginBottom: 7 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%", background: C.surface, border: `1px solid ${C.border}`,
  borderRadius: 0, padding: "10px 12px", color: C.text, fontSize: 13,
  fontFamily: "'DM Mono', monospace", outline: "none", boxSizing: "border-box",
  transition: "border-color 0.2s",
};

function TextInput({ value, onChange, placeholder, type = "text" }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type} value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ ...inputStyle, borderColor: focused ? C.gold : C.border }}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
    />
  );
}

function SelectInput({ value, onChange, options }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ ...inputStyle, cursor: "pointer" }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function ActionBtn({ label, onClick, variant = "primary", small = false }) {
  const [hovered, setHovered] = useState(false);
  const bg = variant === "primary" ? (hovered ? C.goldDim : "transparent") : (hovered ? "#C96B4C22" : "transparent");
  const border = variant === "primary" ? C.gold : C.red;
  const color = variant === "primary" ? C.gold : C.red;
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        background: bg, border: `1px solid ${border}`, color,
        fontFamily: "'DM Mono', monospace", fontSize: small ? 9 : 10,
        letterSpacing: "0.12em", textTransform: "uppercase",
        padding: small ? "5px 10px" : "10px 20px",
        cursor: "pointer", transition: "background 0.2s",
      }}>{label}</button>
  );
}

function IconBtn({ icon, onClick, color = C.textDim, title }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} title={title}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        background: h ? `${color}18` : "transparent",
        border: `1px solid ${h ? color : "transparent"}`,
        color: h ? color : C.textDim,
        padding: "4px 8px", cursor: "pointer", fontSize: 12,
        transition: "all 0.15s", fontFamily: "monospace",
      }}>{icon}</button>
  );
}

// ─── ROW POPOVER ─────────────────────────────────────────────────────────────
function RowPopover({ id, children, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      {/* Clickable underlined name */}
      <span
        onClick={() => setOpen(o => !o)}
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 15,
          color: open ? C.gold : C.text,
          textDecoration: "underline",
          textDecorationColor: open ? C.gold : `${C.textDim}60`,
          textDecorationStyle: "dotted",
          textUnderlineOffset: "4px",
          cursor: "pointer",
          transition: "color 0.15s, text-decoration-color 0.15s",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.color = C.gold;
          e.currentTarget.style.textDecorationColor = C.gold;
        }}
        onMouseLeave={e => {
          if (!open) {
            e.currentTarget.style.color = C.text;
            e.currentTarget.style.textDecorationColor = `${C.textDim}60`;
          }
        }}
      >
        {children}
      </span>

      {/* Popover menu */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 200,
          background: C.surface,
          border: `1px solid ${C.borderHi}`,
          borderTop: `2px solid ${C.gold}`,
          minWidth: 180,
          boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
          animation: "fadeDown 0.12s ease",
        }}>
          <style>{`@keyframes fadeDown { from { opacity:0; transform:translateY(-4px) } to { opacity:1; transform:translateY(0) } }`}</style>

          <div
            onClick={() => { setOpen(false); onEdit(); }}
            style={{
              padding: "11px 16px", fontSize: 10, letterSpacing: "0.12em",
              textTransform: "uppercase", color: C.textMid, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 10,
              transition: "background 0.15s, color 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = C.goldGlow; e.currentTarget.style.color = C.gold; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.textMid; }}
          >
            <span style={{ fontSize: 13 }}>✎</span> Bewerken
          </div>

          <div style={{ height: 1, background: C.border, margin: "0 12px" }} />

          <div
            onClick={() => { setOpen(false); onDelete(); }}
            style={{
              padding: "11px 16px", fontSize: 10, letterSpacing: "0.12em",
              textTransform: "uppercase", color: C.textDim, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 10,
              transition: "background 0.15s, color 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = `${C.red}12`; e.currentTarget.style.color = C.red; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.textDim; }}
          >
            <span style={{ fontSize: 13 }}>✕</span> Verwijderen
          </div>
        </div>
      )}
    </div>
  );
}


export default function FinancialDashboard() {
  // ── Portfolio state (persistent via localStorage) ──
  const [stocks, setStocksRaw] = useState(() => {
    try { const s = localStorage.getItem("portfolio-stocks"); return s ? JSON.parse(s) : PORTFOLIO.stocks; }
    catch { return PORTFOLIO.stocks; }
  });
  const [realEstate, setRealEstateRaw] = useState(() => {
    try { const s = localStorage.getItem("portfolio-realestate"); return s ? JSON.parse(s) : PORTFOLIO.real_estate; }
    catch { return PORTFOLIO.real_estate; }
  });
  const [savings, setSavingsRaw] = useState(() => {
    try { const s = localStorage.getItem("portfolio-savings"); return s ? JSON.parse(s) : PORTFOLIO.savings; }
    catch { return PORTFOLIO.savings; }
  });

  const setStocks = (val) => {
    const next = typeof val === "function" ? val(stocks) : val;
    setStocksRaw(next);
    try { localStorage.setItem("portfolio-stocks", JSON.stringify(next)); } catch {}
  };
  const setRealEstate = (val) => {
    const next = typeof val === "function" ? val(realEstate) : val;
    setRealEstateRaw(next);
    try { localStorage.setItem("portfolio-realestate", JSON.stringify(next)); } catch {}
  };
  const setSavings = (val) => {
    const next = typeof val === "function" ? val(savings) : val;
    setSavingsRaw(next);
    try { localStorage.setItem("portfolio-savings", JSON.stringify(next)); } catch {}
  };

  const [metals, setMetalsRaw] = useState(() => {
    try { const s = localStorage.getItem("portfolio-metals"); return s ? JSON.parse(s) : PORTFOLIO.precious_metals; }
    catch { return PORTFOLIO.precious_metals; }
  });
  const setMetals = (val) => {
    const next = typeof val === "function" ? val(metals) : val;
    setMetalsRaw(next);
    try { localStorage.setItem("portfolio-metals", JSON.stringify(next)); } catch {}
  };

  // ── UI state ──
  const [activeTab, setActiveTab] = useState("overview");
  const [loadedIn, setLoadedIn] = useState(false);
  const [activeRegion, setActiveRegion] = useState(null);

  // ── Modal state ──
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // ── Logboek state (persistent via localStorage) ──
  const [logEntries, setLogEntries] = useState(() => {
    try { return JSON.parse(localStorage.getItem("portfolio-logboek") || "[]"); }
    catch { return []; }
  });
  const [logModal, setLogModal] = useState(false);
  const [logNote, setLogNote] = useState("");
  const [expandedLog, setExpandedLog] = useState(null);

  const saveLog = (entries) => {
    setLogEntries(entries);
    try { localStorage.setItem("portfolio-logboek", JSON.stringify(entries)); } catch {}
  };

  const addSnapshot = () => {
    const snap = {
      id: Date.now(),
      date: new Date().toISOString(),
      note: logNote.trim(),
      total,
      stocksTotal,
      realEstateTotal,
      metalsTotal,
      savingsTotal,
      stocks: stocks.map(s => ({ id: s.id, ticker: s.ticker, name: s.name, mock_price: s.mock_price, quantity: s.quantity, currency: s.currency, avg_buy: s.avg_buy })),
    };
    const updated = [snap, ...logEntries];
    saveLog(updated);
    setLogModal(false);
    setLogNote("");
  };

  const deleteLogEntry = (id) => saveLog(logEntries.filter(e => e.id !== id));

  useEffect(() => { setTimeout(() => setLoadedIn(true), 80); }, []);

  // ── Calculations (reactive to state) ──
  const stocksTotal = stocks.reduce((s, a) => {
    const price = a.currency === "USD" ? a.mock_price * USD_EUR : a.mock_price;
    return s + price * a.quantity;
  }, 0);
  const realEstateTotal = realEstate.reduce((s, a) => s + (a.value - a.mortgage), 0);
  const metalsTotal = metals.reduce((s, a) => s + a.mock_price_per_gram * a.quantity, 0);
  const savingsTotal = savings.reduce((s, a) => s + a.balance, 0);
  const total = stocksTotal + realEstateTotal + metalsTotal + savingsTotal;

  const positions = stocks.map(a => {
    const price = a.currency === "USD" ? a.mock_price * USD_EUR : a.mock_price;
    const buyPrice = a.currency === "USD" ? a.avg_buy * USD_EUR : a.avg_buy;
    const value = price * a.quantity;
    const cost = buyPrice * a.quantity;
    const pnl = value - cost;
    const pnlPct = (pnl / cost) * 100;
    return { ...a, currentPrice: price, value, pnl, pnlPct };
  });

  const worldDist = calcWorldDistribution(positions);

  const allocationData = [
    { name: "Aandelen & ETF's", value: Math.round(stocksTotal),    pct: ((stocksTotal / total) * 100).toFixed(1) },
    { name: "Vastgoed (netto)", value: Math.round(realEstateTotal), pct: ((realEstateTotal / total) * 100).toFixed(1) },
    { name: "Edelmetalen",      value: Math.round(metalsTotal),     pct: ((metalsTotal / total) * 100).toFixed(1) },
    { name: "Spaargeld",        value: Math.round(savingsTotal),    pct: ((savingsTotal / total) * 100).toFixed(1) },
  ];

  // Bouw historische data op vanuit logboek (oudste eerst)
  const historyData = [...logEntries].reverse().map(e => ({
    date: new Date(e.date).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "2-digit" }),
    value: e.total,
    id: e.id,
  }));

  const prevValue = logEntries.length >= 2 ? logEntries[1].total : total;
  const ytdChange = total - prevValue;
  const ytdPct = ((ytdChange / prevValue) * 100).toFixed(2);

  // ── CRUD handlers: Stocks ──
  const openAddStock = () => {
    setForm({ name: "", ticker: "", quantity: "", avg_buy: "", mock_price: "", currency: "EUR" });
    setModal({ type: "stock", mode: "add" });
  };
  const openEditStock = (s) => {
    setForm({ ...s, quantity: String(s.quantity), avg_buy: String(s.avg_buy), mock_price: String(s.mock_price) });
    setModal({ type: "stock", mode: "edit", id: s.id });
  };
  const saveStock = () => {
    const entry = {
      id: modal.mode === "add" ? "s-" + Date.now() : modal.id,
      name: form.name, ticker: form.ticker.toUpperCase(),
      quantity: parseFloat(form.quantity) || 0,
      avg_buy: parseFloat(form.avg_buy) || 0,
      mock_price: parseFloat(form.mock_price) || 0,
      currency: form.currency,
    };
    if (modal.mode === "add") setStocks(prev => [...prev, entry]);
    else setStocks(prev => prev.map(s => s.id === modal.id ? entry : s));
    setModal(null);
  };
  const deleteStock = (id) => { setStocks(prev => prev.filter(s => s.id !== id)); setDeleteConfirm(null); };

  // ── CRUD handlers: Real Estate ──
  const openAddRE = () => {
    setForm({ name: "", type: "primary_residence", value: "", purchase_price: "", extra_costs: "", mortgage: "", currency: "EUR" });
    setModal({ type: "re", mode: "add" });
  };
  const openEditRE = (r) => {
    setForm({ ...r, value: String(r.value), mortgage: String(r.mortgage), purchase_price: String(r.purchase_price || ""), extra_costs: String(r.extra_costs || "") });
    setModal({ type: "re", mode: "edit", id: r.id });
  };
  const saveRE = () => {
    const pp = parseFloat(form.purchase_price) || 0;
    const ec = parseFloat(form.extra_costs) || 0;
    const mort = parseFloat(form.mortgage) || 0;
    const entry = {
      id: modal.mode === "add" ? "re-" + Date.now() : modal.id,
      name: form.name, type: form.type,
      value: parseFloat(form.value) || 0,
      purchase_price: pp,
      extra_costs: ec,
      mortgage: mort,
      eigen_inleg: pp ? (pp - mort + ec) : 0,
      currency: form.currency,
    };
    if (modal.mode === "add") setRealEstate(prev => [...prev, entry]);
    else setRealEstate(prev => prev.map(r => r.id === modal.id ? entry : r));
    setModal(null);
  };
  const deleteRE = (id) => { setRealEstate(prev => prev.filter(r => r.id !== id)); setDeleteConfirm(null); };


  // ── CRUD handlers: Metals ──
  const openAddMetal = () => {
    setForm({ name: "", metal: "XAU", quantity: "", unit: "gram", mock_price_per_gram: "", currency: "EUR" });
    setModal({ type: "metal", mode: "add" });
  };
  const openEditMetal = (m) => {
    setForm({ ...m, quantity: String(m.quantity), mock_price_per_gram: String(m.mock_price_per_gram) });
    setModal({ type: "metal", mode: "edit", id: m.id });
  };
  const saveMetal = () => {
    const entry = {
      id: modal.mode === "add" ? "m-" + Date.now() : modal.id,
      name: form.name, metal: form.metal,
      quantity: parseFloat(form.quantity) || 0,
      unit: form.unit,
      mock_price_per_gram: parseFloat(form.mock_price_per_gram) || 0,
      currency: form.currency,
    };
    if (modal.mode === "add") setMetals(prev => [...prev, entry]);
    else setMetals(prev => prev.map(m => m.id === modal.id ? entry : m));
    setModal(null);
  };
  const deleteMetal = (id) => { setMetals(prev => prev.filter(m => m.id !== id)); setDeleteConfirm(null); };

  // ── CRUD handlers: Savings ──
  const openAddSavings = () => {
    setForm({ name: "", institution: "", balance: "", rate: "", type: "savings_account", currency: "EUR", start_date: "", end_date: "" });
    setModal({ type: "savings", mode: "add" });
  };
  const openEditSavings = (s) => {
    setForm({ ...s, balance: String(s.balance), rate: String(s.rate), start_date: s.start_date || "", end_date: s.end_date || "" });
    setModal({ type: "savings", mode: "edit", id: s.id });
  };
  const saveSavings = () => {
    const entry = {
      id: modal.mode === "add" ? "sav-" + Date.now() : modal.id,
      name: form.name, institution: form.institution,
      balance: parseFloat(form.balance) || 0,
      rate: parseFloat(form.rate) || 0,
      type: form.type, currency: form.currency,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
    };
    if (modal.mode === "add") setSavings(prev => [...prev, entry]);
    else setSavings(prev => prev.map(s => s.id === modal.id ? entry : s));
    setModal(null);
  };
  const deleteSavings = (id) => { setSavings(prev => prev.filter(s => s.id !== id)); setDeleteConfirm(null); };

  const style = {
    root: {
      minHeight: "100vh",
      background: C.bg,
      fontFamily: "'DM Mono', monospace",
      color: C.text,
      opacity: loadedIn ? 1 : 0,
      transition: "opacity 0.6s ease",
    },
    header: {
      borderBottom: `1px solid ${C.border}`,
      padding: "0 48px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      height: 64,
      background: `linear-gradient(180deg, ${C.surface} 0%, ${C.bg} 100%)`,
    },
    logo: {
      fontFamily: "'Cormorant Garamond', serif",
      fontWeight: 300,
      fontSize: 22,
      letterSpacing: "0.08em",
      color: C.text,
      display: "flex",
      alignItems: "center",
      gap: 10,
    },
    logoAccent: { color: C.gold },
    headerRight: {
      fontFamily: "'DM Mono', monospace",
      fontSize: 10,
      color: C.textDim,
      textAlign: "right",
      letterSpacing: "0.08em",
    },
    nav: {
      display: "flex",
      gap: 0,
      borderBottom: `1px solid ${C.border}`,
      padding: "0 48px",
      background: C.surface,
    },
    navItem: (active) => ({
      padding: "14px 20px",
      fontSize: 10,
      letterSpacing: "0.15em",
      textTransform: "uppercase",
      cursor: "pointer",
      color: active ? C.gold : C.textDim,
      borderBottom: active ? `1px solid ${C.gold}` : "1px solid transparent",
      transition: "color 0.2s, border-color 0.2s",
      userSelect: "none",
    }),
    main: { padding: "40px 48px", margin: "0 auto" },
    sectionTitle: {
      fontFamily: "'Cormorant Garamond', serif",
      fontWeight: 300,
      fontSize: 13,
      letterSpacing: "0.2em",
      textTransform: "uppercase",
      color: C.gold,
      marginBottom: 20,
    },
    grid4: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 40 },
    grid2: { display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24, marginBottom: 40 },
    chartCard: {
      background: C.card,
      border: `1px solid ${C.border}`,
      padding: "28px",
    },
    table: { width: "100%", borderCollapse: "collapse" },
    th: {
      fontFamily: "'DM Mono', monospace",
      fontSize: 9,
      letterSpacing: "0.18em",
      color: C.textDim,
      textTransform: "uppercase",
      textAlign: "left",
      padding: "0 0 14px",
      borderBottom: `1px solid ${C.border}`,
      fontWeight: 400,
    },
    td: {
      padding: "14px 0",
      borderBottom: `1px solid ${C.border}20`,
      fontSize: 12,
      verticalAlign: "middle",
    },
    badge: (color) => ({
      display: "inline-block",
      padding: "2px 8px",
      fontSize: 9,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color,
      border: `1px solid ${color}40`,
      background: `${color}10`,
    }),
  };

  const tabs = ["overview", "posities", "wereldverdeling", "history", "logboek"];
  const tabLabels = { overview: "Overzicht", posities: "Posities", wereldverdeling: "Wereldverdeling", history: "Vermogensgroei", logboek: "Logboek" };

  return (
    <div style={style.root}>
      {/* HEADER */}
      <header style={style.header}>
        <div style={style.logo}>
          <span style={{ color: C.gold, fontSize: 18 }}>◆</span>
          <span>Privé <span style={style.logoAccent}>Vermogensbeheer</span></span>
        </div>
        <div style={style.headerRight}>
          <div>Live Dashboard</div>
          <div style={{ color: C.gold, marginTop: 2 }}>
            {new Date().toLocaleDateString("nl-NL", { day: "2-digit", month: "long", year: "numeric" })}
          </div>
        </div>
      </header>

      {/* NAV */}
      <nav style={style.nav}>
        {tabs.map(t => (
          <div key={t} style={style.navItem(activeTab === t)} onClick={() => setActiveTab(t)}>
            {tabLabels[t]}
          </div>
        ))}
      </nav>

      {/* MAIN */}
      <main style={style.main}>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <>
            <div style={style.sectionTitle}>◆ Totaal Vermogen</div>
            <GoldDivider />

            {/* KPIs */}
            <div style={style.grid4}>
              <KPICard
                label="Liquide Vermogen"
                value={fmtEur(stocksTotal + metalsTotal + savingsTotal)}
                sub={`Totaal incl. vastgoed € ${fmt(total)}`}
                trend={ytdChange >= 0 ? "up" : "down"}
              />
              <KPICard label="Aandelen & ETF's" value={fmtEur(stocksTotal)} sub={`${((stocksTotal/total)*100).toFixed(1)}% van portfolio`} />
              <KPICard label="Vastgoed (netto)" value={fmtEur(realEstateTotal)} sub={`${((realEstateTotal/total)*100).toFixed(1)}% van portfolio`} />
              <KPICard label="Spaargeld" value={fmtEur(savingsTotal)} sub={`${((savingsTotal/total)*100).toFixed(1)}% van portfolio`} />
            </div>

            {/* Charts row */}
            <div style={style.grid2}>
              {/* Area chart */}
              <div style={style.chartCard}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, fontWeight: 300, color: C.text, marginBottom: 20 }}>
                  Vermogensontwikkeling
                </div>
                {historyData.length > 1 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={historyData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={C.gold} stopOpacity={0.25} />
                        <stop offset="100%" stopColor={C.gold} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fill: C.textDim, fontSize: 9, fontFamily: "'DM Mono'" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: C.textDim, fontSize: 9, fontFamily: "'DM Mono'" }} axisLine={false} tickLine={false}
                      tickFormatter={v => "€" + (v / 1000).toFixed(0) + "k"} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="value" stroke={C.gold} strokeWidth={1.5}
                      fill="url(#goldGrad)" dot={false} activeDot={{ r: 3, fill: C.gold, stroke: C.bg, strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
                ) : (
                  <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
                    <div style={{ fontSize: 11, color: C.textDim }}>Sla 2+ snapshots op in het Logboek om de grafiek te zien</div>
                    <ActionBtn label="→ Naar Logboek" onClick={() => setActiveTab("logboek")} small />
                  </div>
                )}
              </div>

              {/* Donut */}
              <div style={style.chartCard}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, fontWeight: 300, color: C.text, marginBottom: 16 }}>
                  Vermogensspreiding
                </div>
                <AllocationDonut data={allocationData} colors={PIE_COLORS} total={total} />
              </div>
            </div>

            {/* Category breakdown */}
            <div style={style.sectionTitle}>◆ Categorie Overzicht</div>
            <GoldDivider />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
              {[
                { label: "Edelmetalen", value: metalsTotal, items: metals.map(m => `${m.name} · ${m.quantity}${m.unit}`) },
                { label: "Spaargeld",   value: savingsTotal, items: savings.map(s => `${s.name} · ${s.rate}%`) },
              ].map(cat => (
                <div key={cat.label} style={{ ...style.chartCard, padding: "20px 24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: C.textDim }}>{cat.label}</div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 300, color: C.gold }}>
                      € {fmt(cat.value)}
                    </div>
                  </div>
                  <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 4 }}>
                    {cat.items.map(i => (
                      <div key={i} style={{ fontSize: 10, color: C.textMid }}>— {i}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* ── LIQUIDITEIT ANALYSE ── */}
            <div style={{ ...style.sectionTitle, marginTop: 32 }}>◆ Liquiditeitsanalyse</div>
            <GoldDivider />
            {(() => {
              const liquide = stocksTotal + metalsTotal + savingsTotal;
              const nietLiquide = realEstateTotal;
              const liquidePct = total > 0 ? (liquide / total) * 100 : 0;
              const nietLiquidePct = total > 0 ? (nietLiquide / total) * 100 : 0;
              const rows = [
                { label: "Spaargeld",             value: savingsTotal, color: "#C96B4C" },
                { label: "Aandelen & ETF's",       value: stocksTotal,  color: "#C9A84C" },
                { label: "Edelmetalen",            value: metalsTotal,  color: "#4CAF7A" },
                { label: "Liquide totaal",         value: liquide,      bold: true },
                { label: "Vastgoed (overwaarde)",  value: nietLiquide,  color: "#4C7AC9" },
                { label: "Niet-liquide totaal",    value: nietLiquide,  bold: true },
                { label: "Netto vermogen",         value: total,        bold: true, gold: true },
              ];
              const analysis = liquidePct >= 70
                ? `${liquidePct.toFixed(0)}% van je vermogen is liquide — je hebt veel financiële flexibiliteit.`
                : liquidePct >= 40
                ? `${liquidePct.toFixed(0)}% is liquide. Een gezonde mix van liquide en vastgoed.`
                : `Slechts ${liquidePct.toFixed(0)}% is liquide — het grootste deel zit vast in stenen (${nietLiquidePct.toFixed(0)}%).`;
              return (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div style={style.chartCard}>
                    <div style={{ fontSize: 10, letterSpacing: "0.15em", color: C.textDim, marginBottom: 16 }}>VERMOGENSCOMPONENTEN</div>
                    <table style={{ ...style.table, width: "100%" }}>
                      <tbody>
                        {rows.map(r => (
                          <tr key={r.label} style={{ borderTop: r.bold ? `1px solid ${C.border}` : "none" }}>
                            <td style={{ ...style.td, color: r.bold ? C.text : C.textMid, paddingTop: r.bold ? 12 : 6, paddingBottom: 6 }}>
                              {r.color && <span style={{ display: "inline-block", width: 8, height: 8, background: r.color, marginRight: 8, borderRadius: 1 }} />}
                              {r.label}
                            </td>
                            <td style={{ ...style.td, textAlign: "right", fontFamily: "'Cormorant Garamond', serif", fontSize: r.gold ? 20 : 16, color: r.gold ? C.gold : r.bold ? C.text : C.textMid, paddingTop: r.bold ? 12 : 6 }}>
                              € {fmt(r.value)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={style.chartCard}>
                    <div style={{ fontSize: 10, letterSpacing: "0.15em", color: C.textDim, marginBottom: 16 }}>LIQUIDE VS. NIET-LIQUIDE</div>
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ display: "flex", height: 28, borderRadius: 2, overflow: "hidden", gap: 2, marginBottom: 8 }}>
                        <div style={{ width: `${liquidePct}%`, background: C.gold, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {liquidePct > 15 && <span style={{ fontSize: 9, color: C.bg, fontFamily: "'DM Mono'" }}>{liquidePct.toFixed(0)}%</span>}
                        </div>
                        <div style={{ flex: 1, background: "#4C7AC9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {nietLiquidePct > 15 && <span style={{ fontSize: 9, color: "#fff", fontFamily: "'DM Mono'" }}>{nietLiquidePct.toFixed(0)}%</span>}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 20 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 10, height: 10, background: C.gold, borderRadius: 1 }} />
                          <span style={{ fontSize: 10, color: C.textMid }}>Liquide · € {fmt(liquide)}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 10, height: 10, background: "#4C7AC9", borderRadius: 1 }} />
                          <span style={{ fontSize: 10, color: C.textMid }}>Vastgoed · € {fmt(nietLiquide)}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
                      <div style={{ fontSize: 10, letterSpacing: "0.1em", color: C.textDim, marginBottom: 8 }}>ANALYSE</div>
                      <div style={{ fontSize: 12, color: C.textMid, lineHeight: 1.7, marginBottom: 16 }}>{analysis}</div>
                      {[
                        { label: "Liquide vermogen", pct: liquidePct },
                        { label: "Vastgoed (niet-liquide)", pct: nietLiquidePct },
                      ].map(item => (
                        <div key={item.label} style={{ marginBottom: 10 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{ fontSize: 10, color: C.textDim }}>{item.label}</span>
                            <span style={{ fontSize: 10, color: C.textMid, fontFamily: "'DM Mono'" }}>{item.pct.toFixed(1)}%</span>
                          </div>
                          <div style={{ height: 4, background: C.border, borderRadius: 2 }}>
                            <div style={{ height: "100%", width: `${item.pct}%`, background: C.gold, borderRadius: 2 }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </>
        )}

        {/* ── POSITIES TAB ── */}
        {activeTab === "posities" && (
          <>
            {/* ── AANDELEN ── */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={style.sectionTitle}>◆ Aandelenposities</div>
              <ActionBtn label="+ Positie toevoegen" onClick={openAddStock} />
            </div>
            <GoldDivider />
            <div style={{ ...style.chartCard, overflowX: "auto", marginBottom: 32 }}>
              <table style={style.table}>
                <thead>
                  <tr>
                    {["Naam", "Ticker", "Aantal", "Aankoopkoers", "Huidige koers", "Waarde", "P&L", "P&L %"].map(h => (
                      <th key={h} style={style.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {positions.map(p => (
                    <tr key={p.id} style={{ transition: "background 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = C.goldGlow}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <td style={{ ...style.td, maxWidth: 220 }}>
                        <RowPopover
                          onEdit={() => openEditStock(p)}
                          onDelete={() => setDeleteConfirm({ type: "stock", id: p.id, name: p.name })}
                        >
                          {p.name}
                        </RowPopover>
                      </td>
                      <td style={style.td}><span style={style.badge(C.gold)}>{p.ticker}</span></td>
                      <td style={style.td}>{p.quantity}</td>
                      <td style={{ ...style.td, color: C.textMid }}>€ {fmt(p.currency === "USD" ? p.avg_buy * USD_EUR : p.avg_buy, 2)}</td>
                      <td style={{ ...style.td, color: C.text }}>€ {fmt(p.currentPrice, 2)}</td>
                      <td style={{ ...style.td, color: C.gold, fontFamily: "'Cormorant Garamond', serif", fontSize: 16 }}>€ {fmt(p.value)}</td>
                      <td style={{ ...style.td, color: p.pnl >= 0 ? C.green : C.red }}>
                        {p.pnl >= 0 ? "+" : ""}€ {fmt(p.pnl)}
                      </td>
                      <td style={style.td}>
                        <span style={style.badge(p.pnlPct >= 0 ? C.green : C.red)}>
                          {p.pnlPct >= 0 ? "▲" : "▼"} {Math.abs(p.pnlPct).toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={5} style={{ ...style.td, color: C.textDim, fontSize: 10, letterSpacing: "0.1em", paddingTop: 20 }}>TOTAAL AANDELEN</td>
                    <td style={{ ...style.td, color: C.gold, fontFamily: "'Cormorant Garamond', serif", fontSize: 20, paddingTop: 20 }}>
                      € {fmt(stocksTotal)}
                    </td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
              {positions.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px 0", color: C.textDim, fontSize: 11, letterSpacing: "0.1em" }}>
                  Geen posities — klik op <span style={{ color: C.gold, cursor: "pointer" }} onClick={openAddStock}>+ Positie toevoegen</span>
                </div>
              )}
            </div>

            {/* ── VASTGOED ── */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={style.sectionTitle}>◆ Vastgoed</div>
              <ActionBtn label="+ Object toevoegen" onClick={openAddRE} />
            </div>
            <GoldDivider />
            <div style={{ ...style.chartCard, overflowX: "auto" }}>
              <table style={style.table}>
                <thead>
                  <tr>
                    {["Naam", "Type", "Aankoopprijs", "Hypotheek", "Huidige waarde", "Overwaarde", "P&L", "ROE"].map(h => (
                      <th key={h} style={style.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {realEstate.map(r => {
                    const overwaarde = r.value - r.mortgage;
                    const eigenInleg = r.eigen_inleg || (r.purchase_price ? r.purchase_price - r.mortgage + (r.extra_costs || 0) : null);
                    const pnl = r.purchase_price ? r.value - r.purchase_price : null;
                    const pnlPct = r.purchase_price ? ((pnl / r.purchase_price) * 100).toFixed(1) : null;
                    const roe = eigenInleg ? (overwaarde / eigenInleg) * 100 : null;
                    return (
                    <tr key={r.id} style={{ transition: "background 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = C.goldGlow}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <td style={{ ...style.td, maxWidth: 200 }}>
                        <RowPopover onEdit={() => openEditRE(r)} onDelete={() => setDeleteConfirm({ type: "re", id: r.id, name: r.name })}>
                          {r.name}
                        </RowPopover>
                      </td>
                      <td style={style.td}><span style={style.badge(C.textMid)}>{r.type}</span></td>
                      <td style={{ ...style.td, color: C.textMid }}>
                        {r.purchase_price ? `€ ${fmt(r.purchase_price)}` : <span style={{ color: C.textDim }}>—</span>}
                      </td>
                      <td style={{ ...style.td, color: C.red }}>− € {fmt(r.mortgage)}</td>
                      <td style={{ ...style.td, color: C.text }}>€ {fmt(r.value)}</td>
                      <td style={{ ...style.td, color: C.gold, fontFamily: "'Cormorant Garamond', serif", fontSize: 16 }}>€ {fmt(overwaarde)}</td>
                      <td style={{ ...style.td, color: pnl >= 0 ? C.green : C.red }}>
                        {pnl !== null ? `${pnl >= 0 ? "+" : ""}€ ${fmt(pnl)}` : <span style={{ color: C.textDim }}>—</span>}
                      </td>
                      <td style={style.td}>
                        {roe !== null
                          ? <span style={style.badge(roe >= 0 ? C.green : C.red)}>{roe >= 0 ? "▲" : "▼"} {Math.abs(roe).toFixed(0)}%</span>
                          : <span style={{ color: C.textDim }}>—</span>}
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={5} style={{ ...style.td, color: C.textDim, fontSize: 10, letterSpacing: "0.1em", paddingTop: 20 }}>TOTAAL VASTGOED (NETTO)</td>
                    <td style={{ ...style.td, color: C.gold, fontFamily: "'Cormorant Garamond', serif", fontSize: 20, paddingTop: 20 }}>
                      € {fmt(realEstateTotal)}
                    </td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
              {realEstate.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px 0", color: C.textDim, fontSize: 11, letterSpacing: "0.1em" }}>
                  Geen vastgoed — klik op <span style={{ color: C.gold, cursor: "pointer" }} onClick={openAddRE}>+ Object toevoegen</span>
                </div>
              )}
            </div>

            {/* ── EDELMETALEN ── */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, marginTop: 32 }}>
              <div style={style.sectionTitle}>◆ Edelmetalen</div>
              <ActionBtn label="+ Metaal toevoegen" onClick={openAddMetal} />
            </div>
            <GoldDivider />
            <div style={{ ...style.chartCard, overflowX: "auto", marginBottom: 32 }}>
              <table style={style.table}>
                <thead>
                  <tr>
                    {["Naam", "Metaal", "Hoeveelheid", "Prijs per gram", "Waarde"].map(h => (
                      <th key={h} style={style.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {metals.map(m => (
                    <tr key={m.id} style={{ transition: "background 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = C.goldGlow}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <td style={{ ...style.td, maxWidth: 220 }}>
                        <RowPopover
                          onEdit={() => openEditMetal(m)}
                          onDelete={() => setDeleteConfirm({ type: "metal", id: m.id, name: m.name })}
                        >
                          {m.name}
                        </RowPopover>
                      </td>
                      <td style={style.td}><span style={style.badge(C.gold)}>{m.metal}</span></td>
                      <td style={{ ...style.td, fontFamily: "'DM Mono'" }}>{fmt(m.quantity)} {m.unit}</td>
                      <td style={{ ...style.td, color: C.textMid, fontFamily: "'DM Mono'" }}>€ {fmt(m.mock_price_per_gram, 2)}</td>
                      <td style={{ ...style.td, color: C.gold, fontFamily: "'Cormorant Garamond', serif", fontSize: 16 }}>
                        € {fmt(m.mock_price_per_gram * m.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={4} style={{ ...style.td, color: C.textDim, fontSize: 10, letterSpacing: "0.1em", paddingTop: 20 }}>TOTAAL EDELMETALEN</td>
                    <td style={{ ...style.td, color: C.gold, fontFamily: "'Cormorant Garamond', serif", fontSize: 20, paddingTop: 20 }}>
                      € {fmt(metalsTotal)}
                    </td>
                  </tr>
                </tfoot>
              </table>
              {metals.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px 0", color: C.textDim, fontSize: 11, letterSpacing: "0.1em" }}>
                  Geen edelmetalen — klik op <span style={{ color: C.gold, cursor: "pointer" }} onClick={openAddMetal}>+ Metaal toevoegen</span>
                </div>
              )}
            </div>

            {/* ── SPAARGELD ── */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, marginTop: 32 }}>
              <div style={style.sectionTitle}>◆ Spaargeld</div>
              <ActionBtn label="+ Rekening toevoegen" onClick={openAddSavings} />
            </div>
            <GoldDivider />
            <div style={{ ...style.chartCard, overflowX: "auto" }}>
              <table style={style.table}>
                <thead>
                  <tr>
                    {["Naam", "Instelling", "Type", "Rente", "Looptijd", "Rendement", "Saldo"].map(h => (
                      <th key={h} style={style.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {savings.map(s => {
                    const isDeposit = s.type === "term_deposit";
                    const today = new Date();

                    // Looptijd & rendement berekening
                    let durationDays = null, durationLabel = "—", progressPct = 0;
                    let totalYield = null, earnedYield = null, remainingDays = null;

                    if (isDeposit && s.start_date && s.end_date) {
                      const start = new Date(s.start_date);
                      const end   = new Date(s.end_date);
                      durationDays = Math.round((end - start) / 86400000);
                      const elapsed = Math.max(0, Math.min(durationDays, Math.round((today - start) / 86400000)));
                      remainingDays = Math.max(0, durationDays - elapsed);
                      progressPct = Math.min(100, (elapsed / durationDays) * 100);

                      const years = durationDays / 365;
                      totalYield = s.balance * (s.rate / 100) * years;
                      earnedYield = s.balance * (s.rate / 100) * (elapsed / 365);

                      const months = Math.round(durationDays / 30);
                      durationLabel = months >= 12 ? `${(months/12).toFixed(1)}j` : `${months}m`;
                    }

                    const annualYield = s.balance * (s.rate / 100);

                    return (
                      <tr key={s.id} style={{ transition: "background 0.15s" }}
                        onMouseEnter={e => e.currentTarget.style.background = C.goldGlow}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <td style={{ ...style.td, maxWidth: 200 }}>
                          <RowPopover
                            onEdit={() => openEditSavings(s)}
                            onDelete={() => setDeleteConfirm({ type: "savings", id: s.id, name: s.name })}
                          >
                            {s.name}
                          </RowPopover>
                        </td>
                        <td style={{ ...style.td, color: C.textMid }}>{s.institution || "—"}</td>
                        <td style={style.td}><span style={style.badge(isDeposit ? C.gold : C.textDim)}>{isDeposit ? "Deposito" : s.type}</span></td>
                        <td style={{ ...style.td, color: C.green, fontFamily: "'DM Mono'" }}>{s.rate}%</td>

                        {/* Looptijd kolom */}
                        <td style={{ ...style.td, minWidth: 130 }}>
                          {isDeposit && s.start_date && s.end_date ? (
                            <div>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                <span style={{ fontSize: 9, color: C.textDim }}>
                                  {new Date(s.start_date).toLocaleDateString("nl-NL", { day: "2-digit", month: "short", year: "2-digit" })}
                                </span>
                                <span style={{ fontSize: 9, color: progressPct >= 100 ? C.green : C.gold }}>
                                  {progressPct >= 100 ? "✓ Afgelopen" : `${durationLabel} · nog ${remainingDays}d`}
                                </span>
                              </div>
                              <div style={{ height: 3, background: C.border }}>
                                <div style={{
                                  height: "100%",
                                  width: `${progressPct}%`,
                                  background: progressPct >= 100 ? C.green : C.gold,
                                  transition: "width 0.6s ease",
                                }} />
                              </div>
                              <div style={{ fontSize: 9, color: C.textDim, marginTop: 3 }}>
                                eindigt {new Date(s.end_date).toLocaleDateString("nl-NL", { day: "2-digit", month: "short", year: "numeric" })}
                              </div>
                            </div>
                          ) : (
                            <span style={{ fontSize: 10, color: C.textDim }}>—</span>
                          )}
                        </td>

                        {/* Rendement kolom */}
                        <td style={{ ...style.td, minWidth: 140 }}>
                          {isDeposit && totalYield !== null ? (
                            <div>
                              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: C.green }}>
                                + € {fmt(totalYield)}
                              </div>
                              <div style={{ fontSize: 9, color: C.textDim, marginTop: 2 }}>
                                totaal · verdiend: <span style={{ color: C.green }}>€ {fmt(earnedYield)}</span>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: C.green }}>
                                + € {fmt(annualYield)} <span style={{ fontSize: 10, color: C.textDim }}>/jr</span>
                              </div>
                            </div>
                          )}
                        </td>

                        <td style={{ ...style.td, color: C.gold, fontFamily: "'Cormorant Garamond', serif", fontSize: 16 }}>
                          € {fmt(s.balance)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={5} style={{ ...style.td, color: C.textDim, fontSize: 10, letterSpacing: "0.1em", paddingTop: 20 }}>TOTAAL SPAARGELD</td>
                    <td style={{ ...style.td, color: C.green, fontSize: 11, paddingTop: 20, fontFamily: "'DM Mono'" }}>
                      + € {fmt(savings.reduce((sum, s) => {
                        if (s.type === "term_deposit" && s.start_date && s.end_date) {
                          const days = (new Date(s.end_date) - new Date(s.start_date)) / 86400000;
                          return sum + s.balance * (s.rate / 100) * (days / 365);
                        }
                        return sum + s.balance * (s.rate / 100);
                      }, 0))} rendement
                    </td>
                    <td style={{ ...style.td, color: C.gold, fontFamily: "'Cormorant Garamond', serif", fontSize: 20, paddingTop: 20 }}>
                      € {fmt(savingsTotal)}
                    </td>
                  </tr>
                </tfoot>
              </table>
              {savings.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px 0", color: C.textDim, fontSize: 11, letterSpacing: "0.1em" }}>
                  Geen rekeningen — klik op <span style={{ color: C.gold, cursor: "pointer" }} onClick={openAddSavings}>+ Rekening toevoegen</span>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── WERELDVERDELING TAB ── */}
        {activeTab === "wereldverdeling" && (
          <>
            <div style={style.sectionTitle}>◆ Geografische Spreiding</div>
            <GoldDivider />

            {/* ── Regio overzicht kaarten ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 32 }}>
              {worldDist.map((r) => (
                <div key={r.name}
                  onMouseEnter={() => setActiveRegion(r.name)}
                  onMouseLeave={() => setActiveRegion(null)}
                  style={{
                    background: activeRegion === r.name ? `${r.color}0D` : C.card,
                    border: `1px solid ${activeRegion === r.name ? r.color + "50" : C.border}`,
                    borderLeft: `3px solid ${r.color}`,
                    padding: "20px 22px",
                    transition: "all 0.2s",
                    cursor: "default",
                  }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: C.textDim, lineHeight: 1.4 }}>
                      {r.name}
                    </div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 300, color: r.color, lineHeight: 1 }}>
                      {r.value}%
                    </div>
                  </div>
                  <div style={{ marginTop: 14, height: 3, background: C.border }}>
                    <div style={{ height: "100%", width: `${r.value}%`, background: r.color, transition: "width 0.8s ease" }} />
                  </div>
                  <div style={{ marginTop: 8, fontSize: 10, color: C.textMid, fontFamily: "'DM Mono'" }}>
                    ≈ € {fmt(Math.round(stocksTotal * r.value / 100))}
                  </div>
                </div>
              ))}
            </div>

            {/* ── Per-fonds breakdown ── */}
            <div style={style.sectionTitle}>◆ Verdeling per Fonds</div>
            <GoldDivider />
            <div style={style.chartCard}>
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                {positions.map(p => {
                  const etfData = ETF_REGIONS[p.ticker];
                  if (!etfData) return null;
                  const regs = Object.entries(etfData.regions).filter(([, v]) => v > 0);
                  return (
                    <div key={p.id}>
                      {/* Fonds header */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={style.badge(etfData.color)}>{p.ticker}</span>
                          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, color: C.text }}>{p.name}</span>
                        </div>
                        <span style={{ fontSize: 10, color: C.textMid }}>€ {fmt(p.value)}</span>
                      </div>

                      {/* Gestapelde balk */}
                      <div style={{ display: "flex", height: 20, borderRadius: 1, overflow: "hidden", gap: 2, marginBottom: 10 }}>
                        {regs.map(([region, pct]) => (
                          <div key={region}
                            onMouseEnter={() => setActiveRegion(region)}
                            onMouseLeave={() => setActiveRegion(null)}
                            title={`${region}: ${pct}%`}
                            style={{
                              width: `${pct}%`, background: REGION_COLORS[region],
                              opacity: !activeRegion || activeRegion === region ? 1 : 0.2,
                              transition: "opacity 0.2s", cursor: "pointer", flexShrink: 0,
                            }}
                          />
                        ))}
                      </div>

                      {/* Label rij */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px 16px" }}>
                        {regs.map(([region, pct]) => (
                          <div key={region}
                            onMouseEnter={() => setActiveRegion(region)}
                            onMouseLeave={() => setActiveRegion(null)}
                            style={{
                              display: "flex", alignItems: "center", gap: 5, cursor: "pointer",
                              opacity: !activeRegion || activeRegion === region ? 1 : 0.35,
                              transition: "opacity 0.2s",
                            }}>
                            <div style={{ width: 6, height: 6, background: REGION_COLORS[region], flexShrink: 0 }} />
                            <span style={{ fontSize: 9, color: C.textDim, letterSpacing: "0.08em" }}>{region}</span>
                            <span style={{ fontSize: 9, color: REGION_COLORS[region], fontFamily: "'DM Mono'" }}>{pct}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Gewogen totaal */}
                {positions.length > 0 && (
                  <div style={{ paddingTop: 24, borderTop: `1px solid ${C.border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
                      <span style={{ fontSize: 10, letterSpacing: "0.15em", color: C.gold, textTransform: "uppercase" }}>◆ Gewogen totaal portfolio</span>
                      <span style={{ fontSize: 10, color: C.textMid }}>€ {fmt(stocksTotal)}</span>
                    </div>
                    <div style={{ display: "flex", height: 24, borderRadius: 1, overflow: "hidden", gap: 2, marginBottom: 10 }}>
                      {worldDist.filter(r => r.value > 0).map(r => (
                        <div key={r.name}
                          onMouseEnter={() => setActiveRegion(r.name)}
                          onMouseLeave={() => setActiveRegion(null)}
                          title={`${r.name}: ${r.value}%`}
                          style={{
                            width: `${r.value}%`, background: r.color,
                            opacity: !activeRegion || activeRegion === r.name ? 1 : 0.2,
                            transition: "opacity 0.2s", cursor: "pointer", flexShrink: 0,
                          }}
                        />
                      ))}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "5px 16px" }}>
                      {worldDist.filter(r => r.value > 0).map(r => (
                        <div key={r.name}
                          onMouseEnter={() => setActiveRegion(r.name)}
                          onMouseLeave={() => setActiveRegion(null)}
                          style={{
                            display: "flex", alignItems: "center", gap: 5, cursor: "pointer",
                            opacity: !activeRegion || activeRegion === r.name ? 1 : 0.35,
                            transition: "opacity 0.2s",
                          }}>
                          <div style={{ width: 6, height: 6, background: r.color }} />
                          <span style={{ fontSize: 9, color: C.textDim, letterSpacing: "0.08em" }}>{r.name}</span>
                          <span style={{ fontSize: 9, color: r.color, fontFamily: "'DM Mono'" }}>{r.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── HISTORY TAB ── */}
        {activeTab === "history" && (
          <>
            <div style={style.sectionTitle}>◆ Historische Vermogensgroei</div>
            <GoldDivider />

            {historyData.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0", color: C.textDim }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 300, marginBottom: 12, color: C.textMid }}>
                  Nog geen historische data
                </div>
                <div style={{ fontSize: 11, marginBottom: 24 }}>
                  Sla snapshots op in het Logboek — dan verschijnt hier automatisch je vermogensgroei
                </div>
                <ActionBtn label="→ Naar Logboek" onClick={() => setActiveTab("logboek")} />
              </div>
            ) : (
              <div>
                <div style={style.chartCard}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
                    <div>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 300, color: C.text }}>Totaal Vermogen</div>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 38, fontWeight: 300, color: C.gold, marginTop: 4 }}>
                        € {fmt(total)}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 9, letterSpacing: "0.15em", color: C.textDim, textTransform: "uppercase" }}>Recente mutatie</div>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: ytdChange >= 0 ? C.green : C.red, marginTop: 4 }}>
                        {ytdChange >= 0 ? "+" : ""}€ {fmt(Math.abs(ytdChange))}
                      </div>
                      <div style={{ fontSize: 10, color: ytdChange >= 0 ? C.green : C.red }}>
                        {ytdChange >= 0 ? "▲" : "▼"} {Math.abs(ytdPct)}%
                      </div>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={historyData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="goldGrad2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={C.gold} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={C.gold} stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" tick={{ fill: C.textDim, fontSize: 10, fontFamily: "'DM Mono'" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: C.textDim, fontSize: 10, fontFamily: "'DM Mono'" }} axisLine={false} tickLine={false}
                        tickFormatter={v => "€" + (v / 1000).toFixed(0) + "k"} width={56} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="value" stroke={C.gold} strokeWidth={2}
                        fill="url(#goldGrad2)" dot={{ r: 3, fill: C.bg, stroke: C.gold, strokeWidth: 1.5 }}
                        activeDot={{ r: 5, fill: C.gold, stroke: C.bg, strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ ...style.chartCard, marginTop: 24 }}>
                  <table style={style.table}>
                    <thead>
                      <tr>
                        {["Periode", "Vermogen", "Mutatie", "Groei"].map(h => (
                          <th key={h} style={style.th}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {historyData.map((row, i) => {
                        const prev = i > 0 ? historyData[i - 1].value : row.value;
                        const diff = row.value - prev;
                        const pct = i > 0 ? ((diff / prev) * 100).toFixed(2) : 0;
                        return (
                          <tr key={row.date}
                            onMouseEnter={e => e.currentTarget.style.background = C.goldGlow}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                            style={{ transition: "background 0.15s" }}
                          >
                            <td style={{ ...style.td, fontFamily: "'Cormorant Garamond', serif", fontSize: 16 }}>{row.date}</td>
                            <td style={{ ...style.td, color: C.gold, fontFamily: "'Cormorant Garamond', serif", fontSize: 18 }}>€ {fmt(row.value)}</td>
                            <td style={{ ...style.td, color: diff >= 0 ? C.green : C.red }}>
                              {i > 0 ? (diff >= 0 ? "+" : "") + "€ " + fmt(Math.abs(diff)) : "—"}
                            </td>
                            <td style={style.td}>
                              {i > 0 && (
                                <span style={style.badge(diff >= 0 ? C.green : C.red)}>
                                  {diff >= 0 ? "▲" : "▼"} {Math.abs(pct)}%
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── LOGBOEK TAB ── */}
        {activeTab === "logboek" && (() => {
          const prev = logEntries[1];
          return (
            <>
              {/* Header met snapshot knop */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                <div>
                  <div style={style.sectionTitle}>◆ Koers Logboek</div>
                  <div style={{ fontSize: 11, color: C.textDim, marginTop: -12, marginBottom: 20 }}>
                    Leg periodiek een snapshot vast van je koersen en vermogen
                  </div>
                </div>
                <ActionBtn label="+ Snapshot vastleggen" onClick={() => setLogModal(true)} />
              </div>
              <GoldDivider />

              {logEntries.length === 0 ? (
                <div style={{ textAlign: "center", padding: "80px 0", color: C.textDim }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 300, marginBottom: 12, color: C.textMid }}>
                    Nog geen snapshots
                  </div>
                  <div style={{ fontSize: 11, marginBottom: 24 }}>Werk je koersen bij en klik op "Snapshot vastleggen" om te beginnen</div>
                  <ActionBtn label="+ Eerste snapshot" onClick={() => setLogModal(true)} />
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {logEntries.map((entry, idx) => {
                    const prevEntry = logEntries[idx + 1];
                    const delta = prevEntry ? entry.total - prevEntry.total : null;
                    const deltaPct = delta !== null ? ((delta / prevEntry.total) * 100) : null;
                    const isExpanded = expandedLog === entry.id;
                    const d = new Date(entry.date);
                    const dateStr = d.toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "long", year: "numeric" });
                    const timeStr = d.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });

                    return (
                      <div key={entry.id} style={{ display: "flex", gap: 0 }}>
                        {/* Tijdlijn lijn + dot */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 36, flexShrink: 0 }}>
                          <div style={{
                            width: 10, height: 10, borderRadius: "50%", flexShrink: 0, marginTop: 20,
                            background: idx === 0 ? C.gold : C.border,
                            border: `2px solid ${idx === 0 ? C.gold : C.borderHi}`,
                            boxShadow: idx === 0 ? `0 0 10px ${C.gold}60` : "none",
                            zIndex: 1,
                          }} />
                          {idx < logEntries.length - 1 && (
                            <div style={{ width: 1, flex: 1, background: C.border, minHeight: 24 }} />
                          )}
                        </div>

                        {/* Kaart */}
                        <div style={{
                          flex: 1, marginBottom: 12, marginLeft: 12,
                          background: C.card, border: `1px solid ${idx === 0 ? C.gold + "30" : C.border}`,
                          borderLeft: `3px solid ${idx === 0 ? C.gold : C.borderHi}`,
                        }}>
                          {/* Kaart header — altijd zichtbaar */}
                          <div
                            onClick={() => setExpandedLog(isExpanded ? null : entry.id)}
                            style={{ padding: "16px 20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}
                          >
                            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                              <div style={{ fontSize: 10, color: C.textDim, letterSpacing: "0.1em" }}>
                                {dateStr} · {timeStr}
                                {idx === 0 && <span style={{ marginLeft: 10, color: C.gold, fontSize: 9, letterSpacing: "0.15em" }}>◆ MEEST RECENT</span>}
                              </div>
                              {entry.note && (
                                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, color: C.text, fontStyle: "italic" }}>
                                  "{entry.note}"
                                </div>
                              )}
                            </div>

                            <div style={{ display: "flex", gap: 28, alignItems: "center", flexShrink: 0 }}>
                              <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: 9, color: C.textDim, letterSpacing: "0.1em", marginBottom: 2 }}>TOTAAL VERMOGEN</div>
                                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: C.gold, fontWeight: 300 }}>
                                  € {fmt(entry.total)}
                                </div>
                              </div>
                              {delta !== null && (
                                <div style={{ textAlign: "right" }}>
                                  <div style={{ fontSize: 9, color: C.textDim, letterSpacing: "0.1em", marginBottom: 2 }}>MUTATIE</div>
                                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: delta >= 0 ? C.green : C.red }}>
                                    {delta >= 0 ? "+" : ""}€ {fmt(Math.abs(delta))}
                                  </div>
                                  <div style={{ fontSize: 9, color: delta >= 0 ? C.green : C.red }}>
                                    {delta >= 0 ? "▲" : "▼"} {Math.abs(deltaPct).toFixed(2)}%
                                  </div>
                                </div>
                              )}
                              <div style={{ color: C.textDim, fontSize: 14, marginLeft: 4 }}>
                                {isExpanded ? "▲" : "▼"}
                              </div>
                            </div>
                          </div>

                          {/* Uitklap-detail */}
                          {isExpanded && (
                            <div style={{ borderTop: `1px solid ${C.border}`, padding: "16px 20px" }}>
                              {/* Categorie balken */}
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
                                {[
                                  { label: "Aandelen", value: entry.stocksTotal, color: C.gold },
                                  { label: "Vastgoed", value: entry.realEstateTotal, color: "#4C7AC9" },
                                  { label: "Edelmetalen", value: entry.metalsTotal, color: "#4CAF7A" },
                                  { label: "Spaargeld", value: entry.savingsTotal, color: "#9B6FC9" },
                                ].map(cat => (
                                  <div key={cat.label} style={{ background: C.surface, padding: "12px 14px", border: `1px solid ${C.border}` }}>
                                    <div style={{ fontSize: 9, color: C.textDim, letterSpacing: "0.1em", marginBottom: 6 }}>{cat.label.toUpperCase()}</div>
                                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: cat.color }}>
                                      € {fmt(cat.value)}
                                    </div>
                                    <div style={{ fontSize: 9, color: C.textDim, marginTop: 4 }}>
                                      {((cat.value / entry.total) * 100).toFixed(1)}%
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Koersen tabel */}
                              {entry.stocks?.length > 0 && (
                                <>
                                  <div style={{ fontSize: 9, color: C.textDim, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 10 }}>
                                    Vastgelegde Koersen
                                  </div>
                                  <table style={{ ...style.table, marginBottom: 16 }}>
                                    <thead>
                                      <tr>
                                        {["Ticker", "Naam", "Aant.", "Koers", "Gem. aankoop", "Waarde", "P&L"].map(h => (
                                          <th key={h} style={style.th}>{h}</th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {entry.stocks.map(s => {
                                        const price = s.currency === "USD" ? s.mock_price * USD_EUR : s.mock_price;
                                        const buyP  = s.currency === "USD" ? s.avg_buy * USD_EUR : s.avg_buy;
                                        const val   = price * s.quantity;
                                        const pnl   = (price - buyP) * s.quantity;
                                        return (
                                          <tr key={s.id}>
                                            <td style={{ ...style.td, fontFamily: "'DM Mono'", fontSize: 11 }}>
                                              <span style={{ color: C.gold, border: `1px solid ${C.gold}40`, padding: "1px 6px", fontSize: 9 }}>{s.ticker}</span>
                                            </td>
                                            <td style={{ ...style.td, color: C.textMid, fontSize: 11 }}>{s.name}</td>
                                            <td style={{ ...style.td, fontFamily: "'DM Mono'", fontSize: 11 }}>{s.quantity}</td>
                                            <td style={{ ...style.td, fontFamily: "'DM Mono'", fontSize: 11 }}>
                                              {s.currency === "USD" ? "$" : "€"} {fmt(s.mock_price, 2)}
                                            </td>
                                            <td style={{ ...style.td, fontFamily: "'DM Mono'", fontSize: 11, color: C.textDim }}>
                                              {s.currency === "USD" ? "$" : "€"} {fmt(s.avg_buy, 2)}
                                            </td>
                                            <td style={{ ...style.td, fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: C.gold }}>
                                              € {fmt(val)}
                                            </td>
                                            <td style={{ ...style.td, fontSize: 11, color: pnl >= 0 ? C.green : C.red }}>
                                              {pnl >= 0 ? "+" : ""}€ {fmt(Math.abs(pnl))}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </>
                              )}

                              {/* Verwijder knop */}
                              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                <ActionBtn label="✕ Verwijder snapshot" onClick={() => deleteLogEntry(entry.id)} variant="danger" small />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          );
        })()}

        {/* FOOTER */}
        <div style={{
          marginTop: 60, paddingTop: 24, borderTop: `1px solid ${C.border}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          fontSize: 9, letterSpacing: "0.12em", color: C.textDim, textTransform: "uppercase"
        }}>
          <span>◆ Privé Vermogensbeheer Dashboard</span>
          <span>Prijzen: Mock data — koppel Finnhub API voor live koersen</span>
          <span>USD/EUR: {USD_EUR}</span>
        </div>
      </main>

      {/* ── STOCK MODAL ── */}
      {modal?.type === "stock" && (
        <Modal title={modal.mode === "add" ? "Positie toevoegen" : "Positie bewerken"} onClose={() => setModal(null)}>
          <Field label="Zoek ETF of aandeel">
            <TickerSearch
              value={form.ticker}
              onChange={v => setForm(f => ({ ...f, ticker: v }))}
              onSelect={e => setForm(f => ({
                ...f,
                ticker: e.ticker,
                name: e.name,
                currency: e.currency || f.currency,
              }))}
              placeholder="Zoek op ticker (VWCE) of naam…"
            />
          </Field>
          {/* Geselecteerde ticker + naam tonen / handmatig aanpassen */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 14 }}>
            <Field label="Ticker">
              <TextInput value={form.ticker} onChange={v => setForm(f => ({ ...f, ticker: v.toUpperCase() }))} placeholder="VWCE" />
            </Field>
            <Field label="Naam">
              <TextInput value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Vanguard FTSE All-World…" />
            </Field>
          </div>
          <Field label="Valuta">
            <SelectInput value={form.currency} onChange={v => setForm(f => ({ ...f, currency: v }))}
              options={[{ value: "EUR", label: "EUR" }, { value: "USD", label: "USD" }, { value: "GBP", label: "GBP" }]} />
          </Field>
          <Field label="Aantal">
            <TextInput type="number" value={form.quantity} onChange={v => setForm(f => ({ ...f, quantity: v }))} placeholder="bijv. 100" />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="Gemiddelde aankoopkoers">
              <TextInput type="number" value={form.avg_buy} onChange={v => setForm(f => ({ ...f, avg_buy: v }))} placeholder="bijv. 98.50" />
            </Field>
            <Field label="Huidige koers (mock)">
              <TextInput type="number" value={form.mock_price} onChange={v => setForm(f => ({ ...f, mock_price: v }))} placeholder="bijv. 118.42" />
            </Field>
          </div>
          {/* Live preview */}
          {form.quantity && form.mock_price && (
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, padding: "12px 16px", marginBottom: 20 }}>
              <div style={{ fontSize: 9, color: C.textDim, letterSpacing: "0.1em", marginBottom: 6 }}>PREVIEW</div>
              <div style={{ display: "flex", gap: 24 }}>
                <div>
                  <div style={{ fontSize: 9, color: C.textDim }}>Waarde</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: C.gold }}>
                    € {fmt((parseFloat(form.quantity) || 0) * (parseFloat(form.mock_price) || 0) * (form.currency === "USD" ? USD_EUR : 1))}
                  </div>
                </div>
                {form.avg_buy && (
                  <div>
                    <div style={{ fontSize: 9, color: C.textDim }}>P&L</div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: (() => {
                      const pnl = (parseFloat(form.mock_price) - parseFloat(form.avg_buy)) * (parseFloat(form.quantity) || 0);
                      return pnl >= 0 ? C.green : C.red;
                    })() }}>
                      {(() => {
                        const pnl = (parseFloat(form.mock_price) - parseFloat(form.avg_buy)) * (parseFloat(form.quantity) || 0) * (form.currency === "USD" ? USD_EUR : 1);
                        return (pnl >= 0 ? "+" : "") + "€ " + fmt(Math.abs(pnl));
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <ActionBtn label="Annuleren" onClick={() => setModal(null)} variant="danger" />
            <ActionBtn label={modal.mode === "add" ? "Toevoegen" : "Opslaan"} onClick={saveStock} />
          </div>
        </Modal>
      )}

      {/* ── REAL ESTATE MODAL ── */}
      {modal?.type === "re" && (
        <Modal title={modal.mode === "add" ? "Vastgoed toevoegen" : "Vastgoed bewerken"} onClose={() => setModal(null)}>
          <Field label="Naam">
            <TextInput value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="bijv. Woning Leusden" />
          </Field>
          <Field label="Type">
            <SelectInput value={form.type} onChange={v => setForm(f => ({ ...f, type: v }))}
              options={[
                { value: "primary_residence", label: "Eigen woning" },
                { value: "investment",        label: "Beleggingspand" },
                { value: "commercial",        label: "Commercieel vastgoed" },
                { value: "land",              label: "Grond" },
              ]} />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="Aankoopprijs (€)">
              <TextInput type="number" value={form.purchase_price} onChange={v => setForm(f => ({ ...f, purchase_price: v }))} placeholder="bijv. 361450" />
            </Field>
            <Field label="Huidige marktwaarde (€)">
              <TextInput type="number" value={form.value} onChange={v => setForm(f => ({ ...f, value: v }))} placeholder="bijv. 565000" />
            </Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="Hypotheek (€)">
              <TextInput type="number" value={form.mortgage} onChange={v => setForm(f => ({ ...f, mortgage: v }))} placeholder="bijv. 314136" />
            </Field>
            <Field label="KK + verbouwing (€)">
              <TextInput type="number" value={form.extra_costs} onChange={v => setForm(f => ({ ...f, extra_costs: v }))} placeholder="bijv. 0" />
            </Field>
          </div>
          {form.value && (() => {
            const val  = parseFloat(form.value) || 0;
            const pp   = parseFloat(form.purchase_price) || 0;
            const mort = parseFloat(form.mortgage) || 0;
            const ec   = parseFloat(form.extra_costs) || 0;
            const overwaarde = val - mort;
            const eigenInleg = pp ? (pp - mort + ec) : null;
            const pnl  = pp ? val - pp : null;
            const pnlPct = pp ? ((pnl / pp) * 100).toFixed(1) : null;
            const roe  = eigenInleg ? (overwaarde / eigenInleg) * 100 : null;
            return (
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, padding: "14px 16px", marginBottom: 20, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 9, color: C.textDim, letterSpacing: "0.1em", marginBottom: 4 }}>OVERWAARDE</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: C.gold }}>€ {fmt(overwaarde)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 9, color: C.textDim, letterSpacing: "0.1em", marginBottom: 4 }}>P&L</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: pnl >= 0 ? C.green : C.red }}>
                    {pnl !== null ? `${pnl >= 0 ? "+" : ""}€ ${fmt(pnl)}` : "—"}
                  </div>
                  {pnlPct && <div style={{ fontSize: 10, color: pnl >= 0 ? C.green : C.red }}>{pnl >= 0 ? "▲" : "▼"} {Math.abs(pnlPct)}%</div>}
                </div>
                <div>
                  <div style={{ fontSize: 9, color: C.textDim, letterSpacing: "0.1em", marginBottom: 4 }}>ROE</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: roe >= 0 ? C.green : C.textDim }}>
                    {roe !== null ? `${roe >= 0 ? "▲" : "▼"} ${Math.abs(roe).toFixed(0)}%` : "—"}
                  </div>
                  {eigenInleg && <div style={{ fontSize: 9, color: C.textDim }}>eigen inleg € {fmt(eigenInleg)}</div>}
                </div>
              </div>
            );
          })()}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <ActionBtn label="Annuleren" onClick={() => setModal(null)} variant="danger" />
            <ActionBtn label={modal.mode === "add" ? "Toevoegen" : "Opslaan"} onClick={saveRE} />
          </div>
        </Modal>
      )}

      {/* ── SAVINGS MODAL ── */}
      {modal?.type === "savings" && (
        <Modal title={modal.mode === "add" ? "Rekening toevoegen" : "Rekening bewerken"} onClose={() => setModal(null)}>
          <Field label="Naam">
            <TextInput value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="bijv. Spaarrekening ING" />
          </Field>
          <Field label="Instelling">
            <TextInput value={form.institution} onChange={v => setForm(f => ({ ...f, institution: v }))} placeholder="bijv. ING, Rabobank" />
          </Field>
          <Field label="Type rekening">
            <SelectInput value={form.type} onChange={v => setForm(f => ({ ...f, type: v }))}
              options={[
                { value: "savings_account", label: "Spaarrekening" },
                { value: "term_deposit",    label: "Deposito" },
                { value: "current_account", label: "Betaalrekening" },
                { value: "money_market",    label: "Geldmarktfonds" },
              ]} />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="Saldo (€)">
              <TextInput type="number" value={form.balance} onChange={v => setForm(f => ({ ...f, balance: v }))} placeholder="bijv. 25000" />
            </Field>
            <Field label="Rente (%)">
              <TextInput type="number" value={form.rate} onChange={v => setForm(f => ({ ...f, rate: v }))} placeholder="bijv. 2.5" />
            </Field>
          </div>

          {/* Datum velden — alleen bij deposito */}
          {form.type === "term_deposit" && (
            <>
              <div style={{ height: 1, background: C.border, margin: "4px 0 18px" }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label="Startdatum">
                  <input type="date" value={form.start_date || ""} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                    style={{ ...inputStyle, colorScheme: "dark" }} />
                </Field>
                <Field label="Einddatum">
                  <input type="date" value={form.end_date || ""} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                    style={{ ...inputStyle, colorScheme: "dark" }} />
                </Field>
              </div>
            </>
          )}

          {/* Preview */}
          {form.balance && form.rate && (() => {
            const balance = parseFloat(form.balance) || 0;
            const rate    = parseFloat(form.rate) || 0;
            const isDeposit = form.type === "term_deposit";
            const hasDate = isDeposit && form.start_date && form.end_date;

            let totalYield, earnedYield, durationDays, progressPct = 0, remainingDays = 0;
            if (hasDate) {
              const start = new Date(form.start_date);
              const end   = new Date(form.end_date);
              const today = new Date();
              durationDays = Math.max(1, (end - start) / 86400000);
              const elapsed = Math.max(0, Math.min(durationDays, (today - start) / 86400000));
              remainingDays = Math.max(0, Math.round(durationDays - elapsed));
              progressPct = Math.min(100, (elapsed / durationDays) * 100);
              totalYield  = balance * (rate / 100) * (durationDays / 365);
              earnedYield = balance * (rate / 100) * (elapsed / 365);
            }
            const annualYield = balance * (rate / 100);

            return (
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, padding: "16px", marginBottom: 20 }}>
                <div style={{ fontSize: 9, color: C.textDim, letterSpacing: "0.1em", marginBottom: 12 }}>RENDEMENT OVERZICHT</div>
                <div style={{ display: "grid", gridTemplateColumns: hasDate ? "1fr 1fr 1fr" : "1fr 1fr", gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 9, color: C.textDim, marginBottom: 4 }}>Per jaar</div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: C.green }}>+ € {fmt(annualYield)}</div>
                  </div>
                  {hasDate && (
                    <>
                      <div>
                        <div style={{ fontSize: 9, color: C.textDim, marginBottom: 4 }}>Totaal rendement</div>
                        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: C.green }}>+ € {fmt(totalYield)}</div>
                        <div style={{ fontSize: 9, color: C.textDim, marginTop: 2 }}>
                          over {Math.round(durationDays)} dagen
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 9, color: C.textDim, marginBottom: 4 }}>Al verdiend</div>
                        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: progressPct >= 100 ? C.green : C.gold }}>
                          + € {fmt(earnedYield)}
                        </div>
                        <div style={{ fontSize: 9, color: C.textDim, marginTop: 2 }}>
                          {progressPct >= 100 ? "✓ Afgelopen" : `nog ${remainingDays} dagen`}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                {hasDate && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 9, color: C.textDim }}>
                      <span>{new Date(form.start_date).toLocaleDateString("nl-NL", { day: "2-digit", month: "short", year: "numeric" })}</span>
                      <span style={{ color: progressPct >= 100 ? C.green : C.gold }}>{progressPct.toFixed(0)}%</span>
                      <span>{new Date(form.end_date).toLocaleDateString("nl-NL", { day: "2-digit", month: "short", year: "numeric" })}</span>
                    </div>
                    <div style={{ height: 4, background: C.border }}>
                      <div style={{ height: "100%", width: `${progressPct}%`, background: progressPct >= 100 ? C.green : C.gold, transition: "width 0.5s" }} />
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <ActionBtn label="Annuleren" onClick={() => setModal(null)} variant="danger" />
            <ActionBtn label={modal.mode === "add" ? "Toevoegen" : "Opslaan"} onClick={saveSavings} />
          </div>
        </Modal>
      )}

      {/* ── METAL MODAL ── */}
      {modal?.type === "metal" && (
        <Modal title={modal.mode === "add" ? "Metaal toevoegen" : "Metaal bewerken"} onClose={() => setModal(null)}>
          <Field label="Naam">
            <TextInput value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="bijv. Goud, Zilver, Platina" />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="Metaal">
              <SelectInput value={form.metal} onChange={v => setForm(f => ({ ...f, metal: v }))}
                options={[
                  { value: "XAU", label: "XAU — Goud" },
                  { value: "XAG", label: "XAG — Zilver" },
                  { value: "XPT", label: "XPT — Platina" },
                  { value: "XPD", label: "XPD — Palladium" },
                  { value: "CU",  label: "CU  — Koper" },
                ]} />
            </Field>
            <Field label="Eenheid">
              <SelectInput value={form.unit} onChange={v => setForm(f => ({ ...f, unit: v }))}
                options={[
                  { value: "gram",  label: "Gram" },
                  { value: "oz",    label: "Troy ounce (oz)" },
                  { value: "kg",    label: "Kilogram" },
                  { value: "stuks", label: "Stuks (munten/baren)" },
                ]} />
            </Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="Hoeveelheid">
              <TextInput type="number" value={form.quantity} onChange={v => setForm(f => ({ ...f, quantity: v }))} placeholder="bijv. 500" />
            </Field>
            <Field label="Prijs per gram / eenheid (€)">
              <TextInput type="number" value={form.mock_price_per_gram} onChange={v => setForm(f => ({ ...f, mock_price_per_gram: v }))} placeholder="bijv. 61.20" />
            </Field>
          </div>
          {form.quantity && form.mock_price_per_gram && (
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, padding: "12px 16px", marginBottom: 20 }}>
              <div style={{ fontSize: 9, color: C.textDim, letterSpacing: "0.1em", marginBottom: 6 }}>HUIDIGE WAARDE</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: C.gold }}>
                € {fmt((parseFloat(form.quantity) || 0) * (parseFloat(form.mock_price_per_gram) || 0))}
              </div>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <ActionBtn label="Annuleren" onClick={() => setModal(null)} variant="danger" />
            <ActionBtn label={modal.mode === "add" ? "Toevoegen" : "Opslaan"} onClick={saveMetal} />
          </div>
        </Modal>
      )}

      {/* ── DELETE CONFIRM ── */}
      {deleteConfirm && (
        <Modal title="Verwijderen bevestigen" onClose={() => setDeleteConfirm(null)}>
          <div style={{ color: C.textMid, fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>
            Weet je zeker dat je <span style={{ color: C.text, fontFamily: "'Cormorant Garamond', serif", fontSize: 16 }}>{deleteConfirm.name}</span> wilt verwijderen?
            <br />
            <span style={{ fontSize: 10, color: C.textDim }}>Deze actie kan niet ongedaan worden gemaakt.</span>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <ActionBtn label="Annuleren" onClick={() => setDeleteConfirm(null)} variant="danger" />
            <ActionBtn label="Definitief verwijderen" onClick={() => {
              if (deleteConfirm.type === "stock") deleteStock(deleteConfirm.id);
              else if (deleteConfirm.type === "re") deleteRE(deleteConfirm.id);
              else if (deleteConfirm.type === "savings") deleteSavings(deleteConfirm.id);
              else if (deleteConfirm.type === "metal") deleteMetal(deleteConfirm.id);
            }} />
          </div>
        </Modal>
      )}

      {/* ── SNAPSHOT MODAL ── */}
      {logModal && (
        <Modal title="Snapshot vastleggen" onClose={() => setLogModal(false)}>
          {/* Huidig vermogen preview */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, padding: "16px 20px", marginBottom: 20 }}>
            <div style={{ fontSize: 9, color: C.textDim, letterSpacing: "0.12em", marginBottom: 10 }}>HUIDIGE STAND</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, color: C.gold, fontWeight: 300, marginBottom: 12 }}>
              € {fmt(total)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
              {[
                { label: "Aandelen", value: stocksTotal, color: C.gold },
                { label: "Vastgoed", value: realEstateTotal, color: "#4C7AC9" },
                { label: "Edelmetalen", value: metalsTotal, color: "#4CAF7A" },
                { label: "Spaargeld", value: savingsTotal, color: "#9B6FC9" },
              ].map(cat => (
                <div key={cat.label}>
                  <div style={{ fontSize: 9, color: C.textDim, marginBottom: 3 }}>{cat.label}</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, color: cat.color }}>€ {fmt(cat.value)}</div>
                </div>
              ))}
            </div>
            {/* Aandelen koersen */}
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 9, color: C.textDim, letterSpacing: "0.12em", marginBottom: 8 }}>VAST TE LEGGEN KOERSEN</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {stocks.map(s => (
                  <div key={s.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.textMid }}>
                    <span style={{ color: C.gold, fontFamily: "'DM Mono'", fontSize: 9 }}>{s.ticker}</span>
                    <span>{s.currency === "USD" ? "$" : "€"} {fmt(s.mock_price, 2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Field label="Notitie (optioneel)">
            <textarea
              value={logNote}
              onChange={e => setLogNote(e.target.value)}
              placeholder="bijv. 'Na Q1 herbalancering' of 'Koersen bijgewerkt na jaarrapport'"
              rows={3}
              style={{
                ...inputStyle,
                resize: "vertical",
                lineHeight: 1.6,
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 14,
              }}
            />
          </Field>

          {logEntries.length > 0 && (() => {
            const last = logEntries[0];
            const diff = total - last.total;
            return (
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, padding: "12px 16px", marginBottom: 20 }}>
                <div style={{ fontSize: 9, color: C.textDim, letterSpacing: "0.1em", marginBottom: 6 }}>VERSCHIL T.O.V. VORIGE SNAPSHOT</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: diff >= 0 ? C.green : C.red }}>
                  {diff >= 0 ? "+" : ""}€ {fmt(Math.abs(diff))}
                  <span style={{ fontSize: 12, marginLeft: 10 }}>({diff >= 0 ? "▲" : "▼"} {Math.abs(((diff / last.total) * 100)).toFixed(2)}%)</span>
                </div>
                <div style={{ fontSize: 9, color: C.textDim, marginTop: 4 }}>
                  Vorige snapshot: {new Date(last.date).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}
                </div>
              </div>
            );
          })()}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <ActionBtn label="Annuleren" onClick={() => setLogModal(false)} variant="danger" />
            <ActionBtn label="◆ Snapshot opslaan" onClick={addSnapshot} />
          </div>
        </Modal>
      )}
    </div>
  );
}
