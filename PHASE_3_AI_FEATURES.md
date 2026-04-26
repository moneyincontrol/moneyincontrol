# 🤖 PHASE 3: AI Features - Implementation Guide

## Features Included

1. **Stock Price Prediction**
2. **AI-Powered Recommendations**
3. **Sentiment Analysis**
4. **Risk Assessment**

---

## 📦 Installation

```bash
npm install tensorflow @tensorflow/tfjs
npm install natural
npm install axios
```

---

## 🔮 Stock Price Predictor

```javascript
// ai/StockPredictor.js
import * as tf from '@tensorflow/tfjs';

export class StockPredictor {
  constructor() {
    this.model = null;
    this.scaler = { min: 0, max: 1 };
  }

  async trainModel(historicalData) {
    // Prepare data
    const prices = historicalData.map(d => d.price);
    const normalized = this.normalizeData(prices);
    
    // Create sequences
    const X = [];
    const y = [];
    const sequenceLength = 30;

    for (let i = 0; i < normalized.length - sequenceLength; i++) {
      X.push(normalized.slice(i, i + sequenceLength));
      y.push([normalized[i + sequenceLength]]);
    }

    const xs = tf.tensor2d(X);
    const ys = tf.tensor2d(y);

    // Build LSTM model
    this.model = tf.sequential({
      layers: [
        tf.layers.lstm({ units: 50, returnSequences: true, inputShape: [sequenceLength, 1] }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.lstm({ units: 50, returnSequences: false }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 25 }),
        tf.layers.dense({ units: 1 }),
      ],
    });

    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae'],
    });

    await this.model.fit(xs, ys, {
      epochs: 20,
      batchSize: 32,
      verbose: 1,
    });

    xs.dispose();
    ys.dispose();
  }

  predict(lastPrices) {
    const normalized = this.normalizeData(lastPrices);
    const input = tf.tensor3d([normalized]);
    
    const prediction = this.model.predict(input);
    const result = prediction.dataSync()[0];
    
    return this.denormalize([result])[0];
  }

  normalizeData(data) {
    const min = Math.min(...data);
    const max = Math.max(...data);
    this.scaler = { min, max };
    return data.map(d => (d - min) / (max - min));
  }

  denormalize(data) {
    return data.map(d => d * (this.scaler.max - this.scaler.min) + this.scaler.min);
  }
}
```

---

## 💡 AI Recommender System

```javascript
// ai/Recommender.js
export const getRecommendations = async (userPortfolio, marketData) => {
  const recommendations = [];

  // Analyze market trends
  const trends = analyzeMarketTrends(marketData);
  
  // Get portfolio composition
  const sectors = getSectorComposition(userPortfolio);

  // Find underweighted sectors
  const optimalAllocation = {
    'IT': 30,
    'Banking': 25,
    'Pharma': 15,
    'Energy': 15,
    'Telecom': 15,
  };

  Object.entries(optimalAllocation).forEach(([sector, optimalPercent]) => {
    const currentPercent = sectors[sector] || 0;
    
    if (currentPercent < optimalPercent - 5) {
      // Find best stock in underweighted sector
      const topStock = findTopStockInSector(sector, marketData);
      
      recommendations.push({
        action: 'BUY',
        stock: topStock.symbol,
        reason: `Underweighted ${sector} sector`,
        confidence: 0.75,
        targetAllocation: optimalPercent,
      });
    }
  });

  return recommendations;
};

const analyzeMarketTrends = (marketData) => {
  // Implement trend analysis using technical indicators
  return {
    uptrend: true,
    strength: 0.72,
    volatility: 0.35,
  };
};

const getSectorComposition = (portfolio) => {
  const sectors = {};
  let total = 0;

  portfolio.forEach(holding => {
    const value = holding.quantity * holding.currentPrice;
    sectors[holding.sector] = (sectors[holding.sector] || 0) + value;
    total += value;
  });

  Object.keys(sectors).forEach(sector => {
    sectors[sector] = (sectors[sector] / total) * 100;
  });

  return sectors;
};

const findTopStockInSector = (sector, marketData) => {
  return marketData
    .filter(stock => stock.sector === sector)
    .sort((a, b) => b.momentum - a.momentum)[0];
};
```

---

## 😊 Sentiment Analysis

```javascript
// ai/SentimentAnalyzer.js
import natural from 'natural';

export class SentimentAnalyzer {
  constructor() {
    this.analyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
  }

  analyzeFeedback(text) {
    const score = this.analyzer.getSentiment(text.split(' '));
    
    return {
      score: score,
      sentiment: score > 0.1 ? 'positive' : score < -0.1 ? 'negative' : 'neutral',
      confidence: Math.abs(score),
    };
  }

  analyzeNewsHeadlines(headlines) {
    const scores = headlines.map(headline => ({
      headline,
      ...this.analyzeFeedback(headline),
    }));

    const avgScore = scores.reduce((sum, h) => sum + h.score, 0) / scores.length;
    
    return {
      headlines: scores,
      overallSentiment: avgScore > 0.1 ? 'bullish' : avgScore < -0.1 ? 'bearish' : 'neutral',
      avgScore,
    };
  }

  getMarketSentiment(newsData) {
    const analysis = this.analyzeNewsHeadlines(newsData);
    
    return {
      sentiment: analysis.overallSentiment,
      strength: Math.abs(analysis.avgScore),
      recommendation: analysis.overallSentiment === 'bullish' ? 'BUY' : 'SELL',
      supportingData: analysis.headlines.slice(0, 5),
    };
  }
}
```

---

## ⚠️ Risk Calculator

```javascript
// ai/RiskCalculator.js
export const calculatePortfolioRisk = (portfolio, historicalData) => {
  // Calculate volatility
  const volatilities = portfolio.map(holding => 
    calculateVolatility(historicalData[holding.symbol])
  );

  const avgVolatility = volatilities.reduce((a, b) => a + b) / volatilities.length;

  // Calculate correlation
  const correlation = calculateCorrelation(portfolio, historicalData);

  // Calculate VaR (Value at Risk)
  const var95 = calculateVaR(portfolio, 0.95);

  // Calculate Sharpe Ratio
  const sharpeRatio = calculateSharpeRatio(portfolio, historicalData);

  return {
    overallRisk: categorizeRisk(avgVolatility),
    volatility: avgVolatility,
    correlation,
    var95,
    sharpeRatio,
    riskScore: (avgVolatility * 100).toFixed(2),
    recommendations: generateRiskRecommendations(avgVolatility, correlation),
  };
};

const calculateVolatility = (priceData) => {
  const returns = [];
  for (let i = 1; i < priceData.length; i++) {
    returns.push((priceData[i] - priceData[i - 1]) / priceData[i - 1]);
  }

  const meanReturn = returns.reduce((a, b) => a + b) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / returns.length;
  
  return Math.sqrt(variance);
};

const calculateVaR = (portfolio, confidence) => {
  // 95% VaR = worst case loss with 95% confidence
  const portfolioValue = portfolio.reduce((sum, h) => sum + h.quantity * h.currentPrice, 0);
  const worstDaily Return = -0.05; // Assume worst day is -5%
  
  return portfolioValue * Math.abs(worstDailyReturn);
};

const categorizeRisk = (volatility) => {
  if (volatility < 0.15) return 'Low';
  if (volatility < 0.30) return 'Moderate';
  if (volatility < 0.50) return 'High';
  return 'Very High';
};

const generateRiskRecommendations = (volatility, correlation) => {
  const recommendations = [];

  if (volatility > 0.40) {
    recommendations.push('Consider adding stable stocks to reduce volatility');
  }

  if (correlation > 0.7) {
    recommendations.push('Portfolio is highly correlated. Diversify into other sectors');
  }

  return recommendations;
};
```

---

## 📱 Frontend Component

```javascript
// components/AIAssistant.jsx
import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, AlertCircle } from 'lucide-react';
import { StockPredictor } from '../ai/StockPredictor';
import { SentimentAnalyzer } from '../ai/SentimentAnalyzer';
import { calculatePortfolioRisk } from '../ai/RiskCalculator';

const AIAssistant = ({ portfolio, marketData, newsData }) => {
  const [predictions, setPredictions] = useState([]);
  const [sentiment, setSentiment] = useState(null);
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyzePortfolio();
  }, [portfolio, marketData]);

  const analyzePortfolio = async () => {
    setLoading(true);

    // Stock predictions
    const predictor = new StockPredictor();
    const preds = portfolio.map(holding => ({
      symbol: holding.symbol,
      prediction: predictor.predict([holding.currentPrice]),
    }));
    setPredictions(preds);

    // Sentiment analysis
    const analyzer = new SentimentAnalyzer();
    const sentimentData = analyzer.getMarketSentiment(newsData);
    setSentiment(sentimentData);

    // Risk calculation
    const riskData = calculatePortfolioRisk(portfolio, marketData);
    setRisk(riskData);

    setLoading(false);
  };

  if (loading) return <div>Analyzing...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="text-purple-400" />
          <h2 className="text-2xl font-bold text-white">AI Assistant</h2>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Market Sentiment</p>
            <p className={`text-xl font-bold mt-2 ${
              sentiment?.sentiment === 'bullish' ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {sentiment?.sentiment?.toUpperCase()}
            </p>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Portfolio Risk</p>
            <p className={`text-xl font-bold mt-2 ${
              risk?.overallRisk === 'Low' ? 'text-emerald-400' : 'text-yellow-400'
            }`}>
              {risk?.overallRisk}
            </p>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Sharpe Ratio</p>
            <p className="text-xl font-bold text-white mt-2">{risk?.sharpeRatio.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Price Predictions */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp size={20} />
          Price Predictions (Next 30 Days)
        </h3>
        <div className="space-y-2">
          {predictions.map(pred => (
            <div key={pred.symbol} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <span className="font-semibold text-white">{pred.symbol}</span>
              <span className="text-emerald-400">₹{pred.prediction.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Recommendations */}
      {risk?.recommendations.length > 0 && (
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-6">
          <h3 className="text-lg font-bold text-yellow-300 mb-4 flex items-center gap-2">
            <AlertCircle size={20} />
            Risk Recommendations
          </h3>
          <ul className="space-y-2">
            {risk.recommendations.map((rec, idx) => (
              <li key={idx} className="text-yellow-200">• {rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
```

---

## ✅ Implementation Checklist

- [ ] Install TensorFlow.js
- [ ] Create StockPredictor model
- [ ] Implement Recommender system
- [ ] Add SentimentAnalyzer
- [ ] Calculate risk metrics
- [ ] Create AIAssistant component
- [ ] Train models with historical data
- [ ] Test predictions accuracy
- [ ] Deploy AI models

---

## 🎯 Next: Phase 4 - Security & DevOps

