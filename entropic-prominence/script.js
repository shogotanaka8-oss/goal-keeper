document.addEventListener('DOMContentLoaded', () => {
    // 要素の取得
    const addBtn = document.getElementById('add-btn');
    const goalList = document.getElementById('goal-list');
    const goalTitleInput = document.getElementById('goal-title');
    const goalPeriodSelect = document.getElementById('goal-period');
    const goalDescInput = document.getElementById('goal-desc');
    const goalAnalysisInput = document.getElementById('goal-analysis');
    const goalJudgesInput = document.getElementById('goal-judges');
    const goalVictoryInput = document.getElementById('goal-victory');
    const goalInnovationInput = document.getElementById('goal-innovation');
    const goalAppealInput = document.getElementById('goal-appeal');

    // データ格納用配列
    let goals = [];

    // アプリ起動時にデータを読み込む
    loadGoals();

    // --- イベントリスナー ---

    // 追加ボタンのクリックイベント
    addBtn.addEventListener('click', () => {
        const title = goalTitleInput.value;
        const period = goalPeriodSelect.value;
        const desc = goalDescInput.value;
        const analysis = goalAnalysisInput.value;
        const judges = goalJudgesInput.value;
        const victory = goalVictoryInput.value;
        const innovation = goalInnovationInput.value;
        const appeal = goalAppealInput.value;

        // 入力チェック
        if (title.trim() === '') {
            alert('目標タイトルを入力してください！');
            return;
        }

        // 新しい目標オブジェクトを作成
        const newGoal = {
            id: Date.now(), // 現在時刻をIDとして使用
            title: title,
            period: period,
            desc: desc,
            analysis: analysis,
            judges: judges,
            victory: victory,
            innovation: innovation,
            appeal: appeal,
            status: 'not-started', // 初期ステータス
            createdAt: new Date().toISOString()
        };

        // 配列に追加
        goals.push(newGoal);

        // 保存して画面を更新
        saveGoals();
        renderGoals();

        // フォームをクリアしてタイトルにフォーカスを戻す
        goalTitleInput.value = '';
        goalDescInput.value = '';
        goalAnalysisInput.value = '';
        goalJudgesInput.value = '';
        goalVictoryInput.value = '';
        goalInnovationInput.value = '';
        goalAppealInput.value = '';
        goalTitleInput.focus();

        alert('目標を追加しました！');
    });

    // --- 関数 ---

    // localStorageからデータを読み込む関数
    function loadGoals() {
        const storedGoals = localStorage.getItem('myGoals');
        if (storedGoals) {
            goals = JSON.parse(storedGoals);
        }
        renderGoals();
    }

    // localStorageにデータを保存する関数
    function saveGoals() {
        localStorage.setItem('myGoals', JSON.stringify(goals));
    }

    // 画面に目標リストを描画する関数
    function renderGoals() {
        // リストを一度クリア
        goalList.innerHTML = '';

        // データがない場合
        if (goals.length === 0) {
            goalList.innerHTML = `
                <div class="empty-state">
                    まだ目標がありません。<br>新しい目標を立ててスタートしましょう！
                </div>
            `;
            return;
        }

        // 最新の目標が上に来るように逆順にする
        const reversedGoals = [...goals].reverse();

        // 各目標ごとにHTMLを作成して追加
        reversedGoals.forEach(goal => {
            const goalCard = document.createElement('div');
            goalCard.className = 'card';

            // 期間の表示名を変換
            const periodLabel = getPeriodLabel(goal.period);

            // 戦略分析セクション（フィールド・審査員・勝利条件）
            let strategyHtml = '';
            if ((goal.analysis && goal.analysis.trim()) ||
                (goal.judges && goal.judges.trim()) ||
                (goal.victory && goal.victory.trim())) {

                let analysisContent = goal.analysis ? `
                    <div class="strategy-item">
                        <h4>フィールド分析</h4>
                        <div class="strategy-content">${escapeHtml(goal.analysis)}</div>
                    </div>` : '';

                let judgesContent = goal.judges ? `
                    <div class="strategy-item">
                        <h4>審査員（キーマン）</h4>
                        <div class="strategy-content text-bold">${escapeHtml(goal.judges)}</div>
                    </div>` : '';

                let victoryContent = goal.victory ? `
                    <div class="strategy-item">
                        <h4>勝利条件</h4>
                        <div class="strategy-content">${escapeHtml(goal.victory)}</div>
                    </div>` : '';

                strategyHtml = `
                    <div class="strategy-section">
                        ${analysisContent}
                        ${judgesContent}
                        ${victoryContent}
                    </div>
                `;
            }

            // 戦術・アピールセクション（新しいアプローチ・アピール戦略）
            let tacticsHtml = '';
            if ((goal.innovation && goal.innovation.trim()) ||
                (goal.appeal && goal.appeal.trim())) {

                let innovationContent = goal.innovation ? `
                    <div class="strategy-item">
                        <h4>新しいアプローチ（創意工夫）</h4>
                        <div class="strategy-content">${escapeHtml(goal.innovation)}</div>
                    </div>` : '';

                let appealContent = goal.appeal ? `
                    <div class="strategy-item">
                        <h4>アピール戦略（見せ方）</h4>
                        <div class="strategy-content">${escapeHtml(goal.appeal)}</div>
                    </div>` : '';

                tacticsHtml = `
                    <div class="strategy-section tactics-section">
                        ${innovationContent}
                        ${appealContent}
                    </div>
                `;
            }

            goalCard.innerHTML = `
                <div class="goal-period-badge">${periodLabel}</div>
                <div class="goal-card-header">
                    <h3 class="goal-title">${escapeHtml(goal.title)}</h3>
                </div>
                <div class="goal-desc">${escapeHtml(goal.desc)}</div>
                
                ${strategyHtml}
                ${tacticsHtml}

                <div class="goal-actions">
                    <button class="btn btn-sm btn-outline delete-btn" data-id="${goal.id}">
                        削除する
                    </button>
                    <!-- 将来的にここにステータス変更ボタンなども追加できます -->
                </div>
            `;

            // 削除ボタンにイベントを追加
            const deleteBtn = goalCard.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => {
                if (confirm('本当にこの目標を削除しますか？')) {
                    deleteGoal(goal.id);
                }
            });

            goalList.appendChild(goalCard);
        });
    }

    // 目標を削除する関数
    function deleteGoal(id) {
        goals = goals.filter(goal => goal.id !== id);
        saveGoals();
        renderGoals();
    }

    // 期間コードを表示用に変換するヘルパー関数
    function getPeriodLabel(periodCode) {
        const labels = {
            '2024-h1': '2024年 上期 (4月-9月)',
            '2024-h2': '2024年 下期 (10月-3月)',
            '2025-h1': '2025年 上期 (4月-9月)',
            '2025-h2': '2025年 下期 (10月-3月)',
            '2026-h1': '2026年 上期 (4月-9月)',
            '2026-h2': '2026年 下期 (10月-3月)',
            '2027-h1': '2027年 上期 (4月-9月)',
            '2027-h2': '2027年 下期 (10月-3月)',
            '2028-h1': '2028年 上期 (4月-9月)',
            '2028-h2': '2028年 下期 (10月-3月)',
            '2029-h1': '2029年 上期 (4月-9月)',
            '2029-h2': '2029年 下期 (10月-3月)',
            '2030-h1': '2030年 上期 (4月-9月)',
            '2030-h2': '2030年 下期 (10月-3月)'
        };
        return labels[periodCode] || periodCode;
    }

    // XSS対策：HTMLエスケープ関数
    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});
