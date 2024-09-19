// 必要なモジュールをインポート
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

// Expressアプリを作成
const app = express();
app.use(bodyParser.json());  // リクエストボディのJSONを解析

// メモリに保存するOTPストア（実際にはデータベースを使うことを推奨）
let otpStore = {};

// OTPを生成する関数（6桁のランダムな数字を生成）
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Nodemailerの設定（Gmailを使って送信する例）
let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'aki.0306.0120@gmail.com',  // 送信元のGmailアドレス
    pass: 'lxjx dsey oebu pycp'    // Gmailのアプリパスワード
  }
});

// OTPをメールで送信するAPIエンドポイント
app.post('/send_otp', (req, res) => {
  const email = req.body.email;

  if (!email) {
    return res.status(400).send('メールアドレスを入力してください');
  }

  // OTPを生成
  const otp = generateOTP();

  // メールの内容
  let mailOptions = {
    from: 'your-email@gmail.com',
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}`
  };

  // メールを送信
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('メール送信エラー:', error);
      return res.status(500).send('メール送信エラー');
    }
    console.log('OTP sent: ', otp);

    // メモリにメールアドレスとOTPを保存（実際にはデータベースに保存）
    otpStore[email] = otp;
    res.status(200).send('OTPが送信されました');
  });
});

// OTPを検証するAPIエンドポイント
app.post('/verify_otp', (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).send('メールアドレスとOTPを入力してください');
  }

  // 保存されたOTPと比較
  if (otpStore[email] === otp) {
    res.status(200).send('OTPが正しく確認されました');
    // OTP確認後に削除（セキュリティ対策）
    delete otpStore[email];
  } else {
    res.status(400).send('OTPが無効です');
  }
});

// サーバーを起動
const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});