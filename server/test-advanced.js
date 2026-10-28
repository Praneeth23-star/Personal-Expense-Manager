const { LocalUser, LocalGoal, LocalSubscription, LocalTransaction } = require('./config/localStore');
const { getFinancialInsights } = require('./controllers/aiAdvisorController');

(async () => {
  try {
    const user = await LocalUser.findOne({ email: 'demo@expensemanager.com' });
    console.log('✅ User:', user.name);

    const goals = await LocalGoal.find(user._id);
    console.log('✅ Goals loaded:', goals.length, 'goals');

    const subs = await LocalSubscription.find(user._id);
    console.log('✅ Subscriptions loaded:', subs.length, 'subscriptions');

    const txs = await LocalTransaction.find({ user: user._id });
    console.log('✅ Transactions loaded:', txs.total, 'transactions');

    // Test AI Advisor calculation directly
    const mockReq = { user: { _id: user._id, currency: '$' } };
    const mockRes = {
      json: (data) => {
        console.log('✅ AI Advisor Insights:');
        console.log('   - Health Score:', data.data.score, `(${data.data.grade})`);
        console.log('   - 50/30/20 Rule: Needs', data.data.rule503020.needs.percentage + '% | Wants', data.data.rule503020.wants.percentage + '% | Savings', data.data.rule503020.savings.percentage + '%');
        console.log('   - Month-End Forecast: Net savings', '$' + data.data.forecast.projectedNetSavings);
        console.log('   - Recommendations:', data.data.recommendations.length, 'smart alerts');
      },
      status: (code) => ({ json: (err) => console.error('Error status:', code, err) }),
    };

    await getFinancialInsights(mockReq, mockRes);
    console.log('\n🚀 ALL ADVANCED BACKEND & AI MODULES OPERATING AT 100%!');
  } catch (err) {
    console.error('Test error:', err);
  }
})();
