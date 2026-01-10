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

    // データ管理・フィルター用要素
    const exportBtn = document.getElementById('export-btn');
    const importBtn = document.getElementById('import-btn');
    const filterBtns = document.querySelectorAll('.filter-btn');

    // データ格納用配列
    let goals = [];
    // 現在のフィルター状態 ('active' | 'completed')
    let currentFilter = 'active';

    // アプリ起動時にデータを読み込む
    loadGoals();

    // --- イベントリスナー ---

    // フィルターボタン
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // 見た目の切り替え
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // 状態の更新と再描画
            currentFilter = btn.dataset.filter;
            renderGoals();
        });
    });

    // エクスポートボタン
    exportBtn.addEventListener('click', () => {
        if (goals.length === 0) {
            alert('書き出すデータがありません。');
            return;
        }
        const dataStr = JSON.stringify(goals);
        navigator.clipboard.writeText(dataStr).then(() => {
            alert('データをクリップボードにコピーしました！\nスマホなどの「データを読み込む」ボタンを押して貼り付けてください。');
        }).catch(err => {
            console.error('コピーに失敗しました', err);
            alert('コピーに失敗しました。');
        });
    });

    // インポートボタン
    importBtn.addEventListener('click', () => {
        const dataStr = prompt('コピーしたデータ（文字の羅列）をここに貼り付けてください：');
        if (!dataStr) return;

        try {
            const importedGoals = JSON.parse(dataStr);
            if (!Array.isArray(importedGoals)) throw new Error('Invalid format');

            if (confirm('現在のデータを上書きして読み込みますか？\n（この操作は取り消せません）')) {
                goals = importedGoals;
                saveGoals();
                renderGoals();
                alert('データを読み込みました！');
            }
        } catch (e) {
            alert('データの形式が正しくありません。コピーし直してください。');
        }
    });

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
            status: 'active', // 初期ステータス (active / completed)
            createdAt: new Date().toISOString()
        };

        // 配列に追加
        goals.push(newGoal);

        // 保存して画面を更新
        saveGoals();

        // 追加したら「進行中」タブに切り替えて表示
        if (currentFilter !== 'active') {
            currentFilter = 'active';
            filterBtns.forEach(b => b.classList.remove('active'));
            document.querySelector('[data-filter="active"]').classList.add('active');
        }
        renderGoals();

        // フォームをクリアしてタイトルにフォーカスを戻す (簡略化のため関数にまとめられますがそのまま記述)
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
            try {
                goals = JSON.parse(storedGoals);
                // 古いデータにはstatusがない場合があるので補完
                goals = goals.map(g => ({ ...g, status: g.status || 'active' }));
            } catch (e) {
                goals = [];
            }
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

        // フィルタリング
        const filteredGoals = goals.filter(goal => {
            if (currentFilter === 'active') return goal.status !== 'completed';
            if (currentFilter === 'completed') return goal.status === 'completed';
            return true;
        });

        // データがない場合
        if (filteredGoals.length === 0) {
            const message = currentFilter === 'active'
                ? '進行中の目標はありません。<br>新しい目標を立ててスタートしましょう！'
                : '完了した目標はまだありません。<br>達成目指して頑張りましょう！';

            goalList.innerHTML = `
                <div class="empty-state">${message}</div>
            `;
            return;
        }

        // 最新の目標が上に来るように逆順にする
        const reversedGoals = [...filteredGoals].reverse();

        // 各目標ごとにHTMLを作成して追加
        reversedGoals.forEach(goal => {
            const goalCard = document.createElement('div');
            goalCard.className = `card ${goal.status === 'completed' ? 'completed' : ''}`;

            // 期間の表示名を変換
            const periodLabel = getPeriodLabel(goal.period);

            // 戦略分析セクション
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
                strategyHtml = `<div class="strategy-section">${analysisContent}${judgesContent}${victoryContent}</div>`;
            }

            // 戦術・アピールセクション
            let tacticsHtml = '';
            if ((goal.innovation && goal.innovation.trim()) ||
                (goal.appeal && goal.appeal.trim())) {

                let innovationContent = goal.innovation ? `
                    <div class="strategy-item">
                        <h4>新しいアプローチ</h4>
                        <div class="strategy-content">${escapeHtml(goal.innovation)}</div>
                    </div>` : '';
                let appealContent = goal.appeal ? `
                    <div class="strategy-item">
                        <h4>アピール戦略</h4>
                        <div class="strategy-content">${escapeHtml(goal.appeal)}</div>
                    </div>` : '';
                tacticsHtml = `<div class="strategy-section tactics-section">${innovationContent}${appealContent}</div>`;
            }

            // ボタンの出し分け
            let actionBtnHtml = '';
            if (goal.status !== 'completed') {
                actionBtnHtml = `
                    <button class="btn btn-sm btn-primary complete-btn" data-id="${goal.id}" style="background-color: var(--success-color);">
                        達成完了！
                    </button>`;
            } else {
                actionBtnHtml = `
                    <button class="btn btn-sm btn-outline restore-btn" data-id="${goal.id}">
                        未完了に戻す
                    </button>`;
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
                    ${actionBtnHtml}
                    <button class="btn btn-sm btn-outline delete-btn" data-id="${goal.id}" style="margin-left: auto;">
                        削除
                    </button>
                </div>
            `;

            // イベントリスナーの追加
            // 削除
            const deleteBtn = goalCard.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => {
                if (confirm('本当にこの目標を削除しますか？')) deleteGoal(goal.id);
            });

            // 完了/戻す
            const completeBtn = goalCard.querySelector('.complete-btn');
            if (completeBtn) {
                completeBtn.addEventListener('click', () => toggleGoalStatus(goal.id, 'completed'));
            }
            const restoreBtn = goalCard.querySelector('.restore-btn');
            if (restoreBtn) {
                restoreBtn.addEventListener('click', () => toggleGoalStatus(goal.id, 'active'));
            }

            goalList.appendChild(goalCard);
        });
    }

    // 目標を削除する関数
    function deleteGoal(id) {
        goals = goals.filter(goal => goal.id !== id);
        saveGoals();
        renderGoals();
    }

    // ステータスを変更する関数
    function toggleGoalStatus(id, newStatus) {
        goals = goals.map(goal => {
            if (goal.id === id) {
                return { ...goal, status: newStatus };
            }
            return goal;
        });
        saveGoals();
        renderGoals();

        if (newStatus === 'completed') {
            alert('おめでとうございます！目標達成です！🎉\n「完了済み」タブに移動しました。');
        }
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
