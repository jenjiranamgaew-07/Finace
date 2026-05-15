import { useState, useEffect } from "react";

// ===== DEFAULT DATA =====
const DEFAULT_SETTINGS = { exchangeRate: 35, monthlyIncome: 3020 };

const DEFAULT_DEBTS = [
  { id: "abn_home", name: "หนี้บ้านไทย ABN", amount: 260, currency: "EUR", totalInstallments: 81, remaining: 79, category: "eur", icon: "🏠" },
  { id: "health_ins", name: "ประกันสุขภาพสะสม", amount: 66, currency: "EUR", totalInstallments: 12, remaining: 11, category: "eur", icon: "🏥" },
  { id: "abn_credit", name: "บัตรเครดิต ABN", amount: 40, currency: "EUR", totalInstallments: 29, remaining: 29, category: "eur", icon: "💳" },
  { id: "bondora", name: "Bondora", amount: 22.74, currency: "EUR", totalInstallments: 28, remaining: 26, category: "eur", icon: "📊" },
  { id: "amex", name: "Amex (จ่ายยอดเต็ม)", amount: 50, currency: "EUR", totalInstallments: 33, remaining: 32, category: "eur", icon: "💳", isRolling: true },
  { id: "coop_loan", name: "กู้สหกรณ์ (คิก)", amountTHB: 3722, amount: 3722/35, currency: "THB", totalInstallments: 166, remaining: 163, category: "thai", icon: "🤝" },
  { id: "car_kik", name: "ไฟแนนซ์รถคิก", amountTHB: 3555, amount: 3555/35, currency: "THB", totalInstallments: 70, remaining: 67, category: "thai", icon: "🚗" },
  { id: "car_kot", name: "ไฟแนนซ์รถคอท", amountTHB: 5400, amount: 5400/35, currency: "THB", totalInstallments: 50, remaining: 48, category: "thai", icon: "🚗" },
  { id: "true_debt", name: "หนี้ทรู", amountTHB: 2830, amount: 2830/35, currency: "THB", totalInstallments: 4, remaining: 1, category: "thai", icon: "📱" },
  { id: "shopee1", name: "Shopee 1", amountTHB: 1822, amount: 1822/35, currency: "THB", totalInstallments: 6, remaining: 4, category: "thai", icon: "🛍️" },
  { id: "shopee2", name: "Shopee 2", amountTHB: 1470, amount: 1470/35, currency: "THB", totalInstallments: 6, remaining: 4, category: "thai", icon: "🛍️" },
  { id: "shopee3", name: "Shopee 3", amountTHB: 3200, amount: 3200/35, currency: "THB", totalInstallments: 10, remaining: 8, category: "thai", icon: "🛍️" },
  { id: "shopee4", name: "Shopee 4", amountTHB: 2900, amount: 2900/35, currency: "THB", totalInstallments: 10, remaining: 9, category: "thai", icon: "🛍️" },
  { id: "shopee2870", name: "Shopee 2870", amountTHB: 2870, amount: 2870/35, currency: "THB", totalInstallments: 4, remaining: 2, category: "thai", icon: "🛍️" },
];

const DEFAULT_EXPENSES = [
  { id: "health", name: "ประกันสุขภาพ VGZ", amount: 149.9, icon: "🏥", category: "fixed" },
  { id: "car_ins", name: "ประกันรถ",
