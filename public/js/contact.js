class ContactForm {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.messageDiv = document.getElementById('formMessage');
        this.initEventListeners();
    }

    initEventListeners() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
    }

    async handleSubmit() {
        const submitBtn = this.form.querySelector('.submit-btn');
        const formData = new FormData(this.form);
        
        // フォームデータを取得
        const contactData = {
            name: formData.get('name'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message'),
            timestamp: new Date().toISOString(),
            id: Date.now()
        };

        // バリデーション
        if (!this.validateForm(contactData)) {
            return;
        }

        // 送信中の状態
        submitBtn.disabled = true;
        submitBtn.textContent = '送信中...';

        try {
            // LocalStorageに保存（実際の実装では外部APIに送信）
            this.saveContact(contactData);
            
            // 成功メッセージ
            this.showMessage('お問い合わせを受け付けました。24時間以内にご返信いたします。', 'success');
            this.form.reset();
            
        } catch (error) {
            // エラーメッセージ
            this.showMessage('送信に失敗しました。しばらく時間をおいて再度お試しください。', 'error');
        } finally {
            // ボタンを元に戻す
            submitBtn.disabled = false;
            submitBtn.textContent = '送信する';
        }
    }

    validateForm(data) {
        const errors = [];

        if (!data.name.trim()) {
            errors.push('お名前を入力してください');
        }

        if (!data.email.trim()) {
            errors.push('メールアドレスを入力してください');
        } else if (!this.isValidEmail(data.email)) {
            errors.push('正しいメールアドレスを入力してください');
        }

        if (!data.subject) {
            errors.push('件名を選択してください');
        }

        if (!data.message.trim()) {
            errors.push('メッセージを入力してください');
        } else if (data.message.trim().length < 10) {
            errors.push('メッセージは10文字以上で入力してください');
        }

        if (errors.length > 0) {
            this.showMessage(errors.join('<br>'), 'error');
            return false;
        }

        return true;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    saveContact(contactData) {
        // LocalStorageに保存
        const contacts = this.getContacts();
        contacts.unshift(contactData);
        localStorage.setItem('blogContacts', JSON.stringify(contacts));
    }

    getContacts() {
        const stored = localStorage.getItem('blogContacts');
        return stored ? JSON.parse(stored) : [];
    }

    showMessage(message, type) {
        this.messageDiv.innerHTML = message;
        this.messageDiv.className = `form-message ${type}`;
        this.messageDiv.style.display = 'block';
        
        // 成功メッセージは5秒後に自動で消す
        if (type === 'success') {
            setTimeout(() => {
                this.messageDiv.style.display = 'none';
            }, 5000);
        }
        
        // メッセージまでスクロール
        this.messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    new ContactForm();
});