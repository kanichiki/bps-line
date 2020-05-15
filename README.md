# MiniGame DABYSS (ダビス)
グループでミニゲームを行うLINE Bot  
友達追加はこちらからお願いします！  
![390zkjvc](https://user-images.githubusercontent.com/45839107/82004363-a6c23a00-969d-11ea-9de1-b79af6d5fffb.png)

# Overview
東京大学工学部の学生主催のプロジェクト、[UTokyo Project Sprint](https://sites.google.com/g.ecc.u-tokyo.ac.jp/utokyo-project-sprint/top)に5/2から参加し、このDABYSS(ダビス)を作成しています。
プロジェクトの条件は、新型コロナウイルスによって深刻な影響を受けている社会に何かしらの形で役に立つサービスを **6週間で**作ってみようというものです。短期間でプロジェクトを作り上げるというコンセプトで行われているプロジェクトで、この6週間の中でアイデア出しからユーザー獲得までを行います。なかなかハードです...  
  
僕らのチームでは現在巷で流行っている「 *オンライン飲み* 」にフォーカスしました。1人で過ごす時間がほとんどになってしまった現在、人とのコミュニケーションをとるということは心の健康を保つために非常に重要なことだと考えております。オンライン飲み、ひいてはオンライン通話が流行っているのはやはり人とコミュニケーションをとりたいというところからきていると思うのですがこういう状況が始まって2か月ほどが経った今、みなさん次のように考えているかもしれません。  
  
**「もう話すことなくない？」**
  
ずっと家の中にいるし、テレビは再放送とか総集編ばっかりだし、前にオンライン飲みしてから何も生活に変化ないし...  
少なくとも僕の周りではこういった声がちらほら聞かれました。これが要因であんまりオンライン通話に参加するのが気乗りしなくなったという意見もありました。  
  
前置きが長くなりましたが、このような状況に対処するために今回僕たちはオンライン通話に特化したミニゲームのbotを作成しました。ここでいう「オンライン通話に特化したミニゲーム」というのは主軸を「会話」に置いているゲーム、トークゲームのことを指します。有名なところでいくと、「人狼」や「ワードウルフ」、マイナーなものだと「パワーワード人狼」、「ウミガメのスープ」などです。5/15現在、遊ぶことができるゲームは「ワードウルフ」のみですが、今後順次遊べるゲームを展開していく予定です！  
このゲームが人々のコミュニケーションをつなぎとめるものになることを願って絶賛開発中です！

# Requirement  
用いている技術は以下の通りです。
- node v12.13.1
- express v4.16.1

# Usage  
次のLINEバージョンで遊ぶことができます([Flex Messageを送信する | LINE Developers](https://developers.line.biz/ja/docs/messaging-api/using-flex-messages/#%E3%81%AF%E3%81%98%E3%82%81%E3%81%AB)より引用)
- iOS版LINE：すべてのバージョン
- Android版LINE：すべてのバージョン
- macOS版LINE：5.17.0以降
- Windows版LINE：5.17.0以降
  
すべてのゲームに共通で、MiniGame DABYSSはグループ（もしくはトークルーム）に招待していただくことで動作します。
ユーザーの表示名を使用するため参加者はDABYSSを友達追加している必要があります。
  
# Author
[kanichiki](https://github.com/kanichiki)
  
