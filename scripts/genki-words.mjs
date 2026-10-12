// The vocabulary of each lesson of GENKI I (3rd edition, The Japan Times), as the book's lesson
// lists (単語) have it, additional vocabulary included: lesson 0 is the greetings and numbers
// before lesson 1. Read from the book (OCR, then checked by hand), in the book's order.
//
// One entry a line: kana ; kanji ; English. The kanji are as the book prints them from lesson 3
// on; for lessons 1 and 2, which the book prints in kana, the usual kanji (cards show them with
// furigana). An empty kanji means the word is written in kana; kanji in brackets, (箸), are only
// for finding the right dictionary entry (はし is chopsticks, not bridge), and the card shows the
// kana; (-) links it to no dictionary word, when the dictionary's is another (ううん isn't うーん).
// ～ marks a suffix or prefix, as in the book. The English is the book's.

export const GENKI = {
  0: `
おはよう ; ; Good morning.
おはようございます ; ; Good morning. (polite)
こんにちは ; ; Good afternoon.
こんばんは ; ; Good evening.
さようなら ; ; Good-bye.
おやすみ ; ; Good night.
おやすみなさい ; ; Good night. (polite)
ありがとう ; ; Thank you.
ありがとうございます ; ; Thank you. (polite)
すみません ; ; Excuse me.; I'm sorry.
いいえ ; ; No.; Not at all.
いってきます ; ; I'll go and come back.
いってらっしゃい ; ; Please go and come back.
ただいま ; ; I'm home.
おかえり ; ; Welcome home.
おかえりなさい ; ; Welcome home. (polite)
いただきます ; ; Thank you for the meal. (before eating)
ごちそうさま ; ; Thank you for the meal. (after eating)
ごちそうさまでした ; ; Thank you for the meal. (after eating, polite)
はじめまして ; ; How do you do?
～です ; ; I am ...
よろしくおねがいします ; よろしくお願いします ; Nice to meet you.
ゼロ ; ; zero
れい ; 零 ; zero
いち ; 一 ; one
に ; 二 ; two
さん ; 三 ; three
よん ; 四 ; four
し ; 四 ; four
ご ; 五 ; five
ろく ; 六 ; six
なな ; 七 ; seven
しち ; 七 ; seven
はち ; 八 ; eight
きゅう ; 九 ; nine
く ; 九 ; nine
じゅう ; 十 ; ten
じゅういち ; 十一 ; eleven
じゅうに ; 十二 ; twelve
じゅうさん ; 十三 ; thirteen
じゅうよん ; 十四 ; fourteen
じゅうご ; 十五 ; fifteen
じゅうろく ; 十六 ; sixteen
じゅうなな ; 十七 ; seventeen
じゅうはち ; 十八 ; eighteen
じゅうきゅう ; 十九 ; nineteen
にじゅう ; 二十 ; twenty
さんじゅう ; 三十 ; thirty
よんじゅう ; 四十 ; forty
ごじゅう ; 五十 ; fifty
ろくじゅう ; 六十 ; sixty
ななじゅう ; 七十 ; seventy
はちじゅう ; 八十 ; eighty
きゅうじゅう ; 九十 ; ninety
ひゃく ; 百 ; one hundred
`,
  1: `
だいがく ; 大学 ; college; university
こうこう ; 高校 ; high school
がくせい ; 学生 ; student
だいがくせい ; 大学生 ; college student
りゅうがくせい ; 留学生 ; international student
せんせい ; 先生 ; teacher; Professor ...
～ねんせい ; ～年生 ; ... year student
いちねんせい ; 一年生 ; first-year student
せんこう ; 専攻 ; major
わたし ; 私 ; I
ともだち ; 友達 ; friend
～さん ; ; Mr./Ms. ...
～じん ; ～人 ; ... people
にほんじん ; 日本人 ; Japanese people
いま ; 今 ; now
ごぜん ; 午前 ; A.M.
ごご ; 午後 ; P.M.
～じ ; ～時 ; o'clock
いちじ ; 一時 ; one o'clock
はん ; 半 ; half
にじはん ; 二時半 ; half past two
にほん ; 日本 ; Japan
アメリカ ; ; U.S.A.
～ご ; ～語 ; ... language
にほんご ; 日本語 ; Japanese language
～さい ; ～歳 ; ... years old
でんわ ; 電話 ; telephone
～ばん ; ～番 ; number ...
ばんごう ; 番号 ; number
なまえ ; 名前 ; name
なん ; 何 ; what (before d, t and n sounds, and counters: what is it, what time)
なに ; 何 ; what (everywhere else: before を and が, and on its own)
あのう ; ; um ...
はい ; ; yes
そうです ; ; That's right.
そうですか ; ; I see.; Is that so?
イギリス ; ; Britain
オーストラリア ; ; Australia
かんこく ; 韓国 ; Korea
カナダ ; ; Canada
ちゅうごく ; 中国 ; China
インド ; ; India
エジプト ; ; Egypt
フィリピン ; ; Philippines
アジアけんきゅう ; アジア研究 ; Asian studies
けいざい ; 経済 ; economics
こうがく ; 工学 ; engineering
こくさいかんけい ; 国際関係 ; international relations
コンピューター ; ; computer
せいじ ; 政治 ; politics
せいぶつがく ; 生物学 ; biology
ビジネス ; ; business
ぶんがく ; 文学 ; literature
れきし ; 歴史 ; history
いしゃ ; 医者 ; doctor
かいしゃいん ; 会社員 ; office worker
かんごし ; 看護師 ; nurse
こうこうせい ; 高校生 ; high school student
しゅふ ; 主婦 ; housewife
だいがくいんせい ; 大学院生 ; graduate student
べんごし ; 弁護士 ; lawyer
おかあさん ; お母さん ; mother
おとうさん ; お父さん ; father
おねえさん ; お姉さん ; older sister
おにいさん ; お兄さん ; older brother
いもうと ; 妹 ; younger sister
おとうと ; 弟 ; younger brother
`,
  2: `
これ ; ; this one, near me. Stands on its own, with no noun after it ("How much is this?"). Not for people
それ ; ; that one, near you. Stands on its own, with no noun after it. Not for people
あれ ; ; that one over there, far from us both. Stands on its own, with no noun after it. Not for people
どれ ; ; which one? (of three or more). Stands on its own; takes が, not は
この ; ; this ..., near me. Always followed by a noun ("this watch"). Fine for people too
その ; ; that ..., near you. Always followed by a noun ("that bag")
あの ; ; that ... over there, far from us both. Always followed by a noun ("that student")
どの ; ; which ...? Always followed by a noun ("which student?"); takes が, not は
ここ ; ; here: this place, near me
そこ ; ; there: that place, near you
あそこ ; ; over there: that place, far from us both
どこ ; ; where? (which place)
だれ ; 誰 ; who
おいしい ; ; delicious
さかな ; 魚 ; fish
とんかつ ; ; pork cutlet
にく ; 肉 ; meat
メニュー ; ; menu
やさい ; 野菜 ; vegetable
かさ ; 傘 ; umbrella
かばん ; (鞄) ; bag
くつ ; 靴 ; shoes
さいふ ; 財布 ; wallet
ジーンズ ; ; jeans
じてんしゃ ; 自転車 ; bicycle
しんぶん ; 新聞 ; newspaper
スマホ ; ; smartphone; mobile
ティーシャツ ; Tシャツ ; T-shirt
とけい ; 時計 ; watch; clock
ノート ; ; notebook
ペン ; ; pen
ぼうし ; 帽子 ; hat; cap
ほん ; 本 ; book
ぎんこう ; 銀行 ; bank
コンビニ ; ; convenience store
トイレ ; ; toilet; restroom
としょかん ; 図書館 ; library
ゆうびんきょく ; 郵便局 ; post office
イギリス ; ; Britain
かんこく ; 韓国 ; Korea
ちゅうごく ; 中国 ; China
えいご ; 英語 ; English (language)
けいざい ; 経済 ; economics
コンピューター ; ; computer
ビジネス ; ; business
れきし ; 歴史 ; history
おかあさん ; お母さん ; mother
おとうさん ; お父さん ; father
いくら ; ; how much
～えん ; ～円 ; ... yen
たかい ; 高い ; expensive; high
いらっしゃいませ ; ; Welcome (to our store).
～をおねがいします ; ～をお願いします ; ..., please.
～をください ; ; Please give me ...
じゃあ ; ; then ...; if that is the case, ...
どうぞ ; ; Please.; Here it is.
どうも ; ; Thank you.
`,
  3: `
えいが ; 映画 ; movie
おんがく ; 音楽 ; music
ざっし ; 雑誌 ; magazine
スポーツ ; ; sports
デート ; ; date (romantic, not calendar)
テニス ; ; tennis
テレビ ; ; TV
アイスクリーム ; ; ice cream
ハンバーガー ; ; hamburger
おさけ ; お酒 ; sake; alcoholic drink
おちゃ ; お茶 ; green tea
コーヒー ; ; coffee
みず ; 水 ; water
あさごはん ; 朝ご飯 ; breakfast
ひるごはん ; 昼ご飯 ; lunch
ばんごはん ; 晩ご飯 ; dinner
いえ ; 家 ; home; house
うち ; (家) ; home; house; my place
がっこう ; 学校 ; school
カフェ ; ; cafe
あした ; 明日 ; tomorrow
きょう ; 今日 ; today
あさ ; 朝 ; morning
こんばん ; 今晩 ; tonight
まいにち ; 毎日 ; every day
まいばん ; 毎晩 ; every night
しゅうまつ ; 週末 ; weekend
どようび ; 土曜日 ; Saturday
にちようび ; 日曜日 ; Sunday
いつ ; ; when
～ごろ ; ; at about ...
いく ; 行く ; to go (destination に/へ)
かえる ; 帰る ; to go back; to return (destination に/へ)
きく ; 聞く ; to listen; to hear (～を)
のむ ; 飲む ; to drink (～を)
はなす ; 話す ; to speak; to talk (language を/で)
よむ ; 読む ; to read (～を)
おきる ; 起きる ; to get up
たべる ; 食べる ; to eat (～を)
ねる ; 寝る ; to sleep; to go to sleep
みる ; 見る ; to see; to look at; to watch (～を)
くる ; 来る ; to come (destination に/へ)
する ; ; to do (～を)
べんきょうする ; 勉強する ; to study (～を)
いい ; ; good
はやい ; 早い ; early
あまり ; ; not much (+ negative)
ぜんぜん ; 全然 ; not at all (+ negative)
たいてい ; ; usually
ちょっと ; ; a little
ときどき ; 時々 ; sometimes
よく ; ; often; much
そうですね ; ; That's right.; Let me see.
でも ; ; but
どうですか ; ; How about ...?; How is ...?
ええ ; ; yes
`,
  4: `
ゲーム ; ; game
アルバイト ; ; part-time job
かいもの ; 買い物 ; shopping
クラス ; ; class
いぬ ; 犬 ; dog
ねこ ; 猫 ; cat
ひと ; 人 ; person
こども ; 子供 ; child
あなた ; ; you
いす ; (椅子) ; chair
つくえ ; 机 ; desk
しゃしん ; 写真 ; picture; photograph
はな ; 花 ; flower
レポート ; ; (term) paper
ごはん ; ご飯 ; rice; meal
パン ; ; bread
おてら ; お寺 ; temple
こうえん ; 公園 ; park
スーパー ; ; supermarket
バスてい ; バス停 ; bus stop
びょういん ; 病院 ; hospital
ホテル ; ; hotel
ほんや ; 本屋 ; bookstore
まち ; 町 ; town; city
レストラン ; ; restaurant
きのう ; 昨日 ; yesterday
～じかん ; ～時間 ; ... hours
いちじかん ; 一時間 ; one hour
せんしゅう ; 先週 ; last week
とき ; 時 ; when ...; at the time of ... (～の)
げつようび ; 月曜日 ; Monday
かようび ; 火曜日 ; Tuesday
すいようび ; 水曜日 ; Wednesday
もくようび ; 木曜日 ; Thursday
きんようび ; 金曜日 ; Friday
あう ; 会う ; to meet; to see (a person) (～に)
ある ; (有る) ; there is ... (place に thing が)
かう ; 買う ; to buy (～を)
かく ; 書く ; to write (person に thing を)
とる ; 撮る ; to take (a picture) (～を)
まつ ; 待つ ; to wait (～を)
わかる ; (分かる) ; to understand (～が)
いる ; (居る) ; (a person) is in ...; stays at ... (place に person が)
～ぐらい ; ; about (approximate measurement)
ごめんなさい ; ; I'm sorry.
それから ; ; and then
だから ; ; so; therefore
たくさん ; ; many; a lot
～と ; ; together with (a person); and
どうして ; ; why
ひとりで ; 一人で ; alone
もしもし ; ; Hello? (used on the phone)
みぎ ; 右 ; right (～の)
ひだり ; 左 ; left (～の)
まえ ; 前 ; front (～の)
うしろ ; 後ろ ; back (～の)
なか ; 中 ; inside (～の)
うえ ; 上 ; on (～の)
した ; 下 ; under (～の)
ちかく ; 近く ; near; nearby (～の)
となり ; 隣 ; next (～の)
あいだ ; 間 ; between (A と B の)
`,
  5: `
たべもの ; 食べ物 ; food
のみもの ; 飲み物 ; drink
くだもの ; 果物 ; fruit
やすみ ; 休み ; holiday; day off; absence
りょこう ; 旅行 ; travel
うみ ; 海 ; sea
サーフィン ; ; surfing
おみやげ ; お土産 ; souvenir
バス ; ; bus
てんき ; 天気 ; weather
しゅくだい ; 宿題 ; homework
テスト ; ; test
たんじょうび ; 誕生日 ; birthday
へや ; 部屋 ; room
ぼく ; 僕 ; I (used by men)
エルサイズ ; Lサイズ ; size L
あたらしい ; 新しい ; new
ふるい ; 古い ; old (thing; not used for people)
あつい ; 暑い ; hot (weather)
さむい ; 寒い ; cold (weather; not used for things)
あつい ; 熱い ; hot (thing)
いそがしい ; 忙しい ; busy (people/days)
おおきい ; 大きい ; large
ちいさい ; 小さい ; small
おもしろい ; 面白い ; interesting; funny
つまらない ; ; boring
やさしい ; ; easy (problem); kind (person)
むずかしい ; 難しい ; difficult
かっこいい ; ; good-looking
こわい ; 怖い ; frightening
たのしい ; 楽しい ; fun
やすい ; 安い ; inexpensive; cheap (thing)
すき ; 好き ; fond of; to like (～が)
きらい ; 嫌い ; disgusted with; to dislike (～が)
だいすき ; 大好き ; very fond of; to love (～が)
だいきらい ; 大嫌い ; to hate (～が)
きれい ; ; beautiful; clean
げんき ; 元気 ; healthy; energetic
しずか ; 静か ; quiet
にぎやか ; ; lively
ひま ; 暇 ; not busy; free (time)
およぐ ; 泳ぐ ; to swim
きく ; 聞く ; to ask (person に)
のる ; 乗る ; to ride; to board (～に)
やる ; ; to do; to perform (～を)
でかける ; 出かける ; to go out
いっしょに ; 一緒に ; together
すごく ; ; extremely
だいじょうぶ ; 大丈夫 ; It's okay.; Not to worry.; Everything is under control.
とても ; ; very
どんな ; ; what kind of ...
～まい ; ～枚 ; [counter for flat objects]
`,
  6: `
かんじ ; 漢字 ; kanji; Chinese character
きょうかしょ ; 教科書 ; textbook
ページ ; ; page
つぎ ; 次 ; next
おかね ; お金 ; money
にもつ ; 荷物 ; baggage
パソコン ; ; personal computer
シャワー ; ; shower
エアコン ; ; air conditioner
でんき ; 電気 ; electricity; light
まど ; 窓 ; window
でんしゃ ; 電車 ; train
くに ; 国 ; country; place of origin
こんしゅう ; 今週 ; this week
らいしゅう ; 来週 ; next week
らいねん ; 来年 ; next year
よる ; 夜 ; night
たいへん ; 大変 ; tough (situation)
あそぶ ; 遊ぶ ; to play; to spend time pleasantly
いそぐ ; 急ぐ ; to hurry
かえす ; 返す ; to return (a thing) (person に thing を)
けす ; 消す ; to turn off; to erase (～を)
しぬ ; 死ぬ ; to die
すわる ; 座る ; to sit down (seat に)
たつ ; 立つ ; to stand up
たばこをすう ; たばこを吸う ; to smoke
つかう ; 使う ; to use (～を)
てつだう ; 手伝う ; to help (person/task を)
はいる ; 入る ; to enter (～に)
もつ ; 持つ ; to carry; to hold (～を)
やすむ ; 休む ; to be absent (from ...); to rest
あける ; 開ける ; to open (something) (～を)
しめる ; 閉める ; to close (something) (～を)
おしえる ; 教える ; to teach; to instruct (person に thing を)
わすれる ; 忘れる ; to forget; to leave behind (～を)
おりる ; 降りる ; to get off (～を)
かりる ; 借りる ; to borrow (person に thing を)
シャワーをあびる ; シャワーを浴びる ; to take a shower
つける ; (点ける) ; to turn on (～を)
でんわする ; 電話する ; to call (～に)
つれてくる ; 連れてくる ; to bring (a person) (～を)
もってくる ; 持ってくる ; to bring (a thing) (～を)
あとで ; 後で ; later on
すぐ ; ; right away
ゆっくり ; ; slowly; leisurely; unhurriedly
けっこうです ; 結構です ; That would be fine.; That wouldn't be necessary.
ほんとうですか ; 本当ですか ; Really?
`,
  7: `
かぞく ; 家族 ; family
おじいさん ; ; grandfather; old man
おばあさん ; ; grandmother; old woman
おにいさん ; お兄さん ; older brother
おねえさん ; お姉さん ; older sister
ちち ; 父 ; (my) father
はは ; 母 ; (my) mother
あに ; 兄 ; (my) older brother
あね ; 姉 ; (my) older sister
いもうと ; 妹 ; younger sister
おとうと ; 弟 ; younger brother
きょうだい ; 兄弟 ; brothers and sisters
おとこのひと ; 男の人 ; man
おんなのひと ; 女の人 ; woman
かいしゃ ; 会社 ; company
しょくどう ; 食堂 ; cafeteria; dining commons
デパート ; ; department store
かみ ; 髪 ; hair
くち ; 口 ; mouth
め ; 目 ; eye
めがね ; 眼鏡 ; glasses
うた ; 歌 ; song
サークル ; ; club activity
くるま ; 車 ; car
ながい ; 長い ; long
みじかい ; 短い ; short (length)
はやい ; 速い ; fast
せがたかい ; 背が高い ; tall (stature)
せがひくい ; 背が低い ; short (stature)
あたまがいい ; 頭がいい ; bright; smart; clever
かわいい ; ; cute
しんせつ ; 親切 ; kind
べんり ; 便利 ; convenient
うたう ; 歌う ; to sing (～を)
かぶる ; (被る) ; to put on (a hat) (～を)
はく ; (履く) ; to put on (items below your waist) (～を)
しる ; 知る ; to get to know (～を)
しっています ; 知っています ; I know
しりません ; 知りません ; I do not know
すむ ; 住む ; to live (～にすんでいます)
はたらく ; 働く ; to work
ふとる ; 太る ; to gain weight
ふとっています ; 太っています ; to be on the heavy side; overweight
めがねをかける ; ; to put on (glasses)
きる ; 着る ; to put on (clothes above your waist) (～を)
やせる ; (痩せる) ; to lose weight
やせています ; ; to be thin
けっこんする ; 結婚する ; to get married (～と)
～が ; ; ..., but
なにも ; 何も ; not ... anything (+ negative)
～にん ; ～人 ; [counter for people]
ひとり ; 一人 ; one person
ふたり ; 二人 ; two people
べつに ; 別に ; nothing in particular (+ negative)
もちろん ; ; of course
よかったら ; ; if you like
`,
  8: `
はれ ; 晴れ ; sunny weather
あめ ; 雨 ; rain
くもり ; 曇り ; cloudy weather
ゆき ; 雪 ; snow
てんきよほう ; 天気予報 ; weather forecast
きおん ; 気温 ; temperature (weather; not used for things)
なつ ; 夏 ; summer
ふゆ ; 冬 ; winter
けさ ; 今朝 ; this morning
あさって ; ; the day after tomorrow
まいしゅう ; 毎週 ; every week
こんげつ ; 今月 ; this month
らいげつ ; 来月 ; next month
かいしゃいん ; 会社員 ; office worker
しごと ; 仕事 ; job; work; occupation
カメラ ; ; camera
カラオケ ; ; karaoke
ところ ; 所 ; place
トマト ; ; tomato
はし ; (箸) ; chopsticks
パーティー ; ; party
バーベキュー ; ; barbecue
ホームステイ ; ; homestay; living with a local family
おふろ ; お風呂 ; bath
スペイン ; ; Spain
なにか ; 何か ; something
じょうず ; 上手 ; skillful; good at ... (～が)
へた ; 下手 ; clumsy; poor at ... (～が)
ゆうめい ; 有名 ; famous
あらう ; 洗う ; to wash (～を)
いう ; 言う ; to say
いる ; (要る) ; to need (～が)
おそくなる ; 遅くなる ; to be late
おふろにはいる ; お風呂に入る ; to take a bath
おもう ; 思う ; to think
きる ; 切る ; to cut (～を)
つくる ; 作る ; to make (～を)
ふる ; 降る ; (rain/snow) falls
もっていく ; 持っていく ; to take (a thing) (～を)
すてる ; 捨てる ; to throw away (～を)
はじめる ; 始める ; to begin (～を)
うんてんする ; 運転する ; to drive (～を)
せんたくする ; 洗濯する ; to do laundry (～を)
そうじする ; 掃除する ; to clean (～を)
りょうりする ; 料理する ; to cook
うん ; ; uh-huh; yes
ううん ; (-) ; uh-uh; no
いつも ; ; always
おそく ; 遅く ; (do something) late
かんぱい ; 乾杯 ; Cheers! (a toast)
みんなで ; ; all (of the people) together
ざんねんですね ; 残念ですね ; That's too bad.
まだ ; ; not ... yet (+ negative)
～について ; ; about ...; concerning ...
～ど ; ～度 ; ... degrees (temperature)
どう ; ; how
`,
  9: `
たんご ; 単語 ; word; vocabulary
さくぶん ; 作文 ; essay; composition
しけん ; 試験 ; exam
てがみ ; 手紙 ; letter
メール ; ; e-mail
ギター ; ; guitar
ピアノ ; ; piano
コンサート ; ; concert
チケット ; ; ticket
かぶき ; 歌舞伎 ; Kabuki; traditional Japanese theatrical art
スキー ; ; ski
おべんとう ; お弁当 ; boxed lunch
ピザ ; ; pizza
びょうき ; 病気 ; illness; sickness
くすり ; 薬 ; medicine
いいこ ; いい子 ; good child
いろ ; 色 ; color
こんど ; 今度 ; near future
せんげつ ; 先月 ; last month
きょねん ; 去年 ; last year
あおい ; 青い ; blue
あかい ; 赤い ; red
くろい ; 黒い ; black
しろい ; 白い ; white
さびしい ; 寂しい ; lonely
わかい ; 若い ; young
いじわる ; 意地悪 ; mean-spirited
おどる ; 踊る ; to dance
おわる ; 終わる ; (something) ends (～が)
くすりをのむ ; 薬を飲む ; to take medicine
にんきがある ; 人気がある ; to be popular
はじまる ; 始まる ; (something) begins (～が)
ひく ; 弾く ; to play (a string instrument or piano) (～を)
もらう ; (貰う) ; to get (from somebody) (person に thing を)
おぼえる ; 覚える ; to memorize (～を)
でる ; 出る ; to appear; to attend (～に); to exit (～を)
うんどうする ; 運動する ; to exercise
さんぽする ; 散歩する ; to take a walk
そう ; ; (I think) so
～から ; ; from ...
～まで ; ; to (a place/a time)
ぜひ ; 是非 ; by all means
ところで ; ; by the way
みんな ; ; all
もう ; ; already
ひとつ ; 一つ ; one
ふたつ ; 二つ ; two
みっつ ; 三つ ; three
よっつ ; 四つ ; four
いつつ ; 五つ ; five
むっつ ; 六つ ; six
ななつ ; 七つ ; seven
やっつ ; 八つ ; eight
ここのつ ; 九つ ; nine
とお ; 十 ; ten
`,
  10: `
きせつ ; 季節 ; season
はる ; 春 ; spring
あき ; 秋 ; fall
ぎゅうにゅう ; 牛乳 ; milk
ケーキ ; ; cake
すし ; ; sushi
てんぷら ; 天ぷら ; tempura
りんご ; ; apple
りょうり ; 料理 ; cuisine
サッカー ; ; soccer
やきゅう ; 野球 ; baseball
いしゃ ; 医者 ; doctor
おかねもち ; お金持ち ; rich person
ゆうめいじん ; 有名人 ; celebrity
かお ; 顔 ; face
としうえ ; 年上 ; someone older
えき ; 駅 ; station
しんかんせん ; 新幹線 ; Shinkansen; "Bullet Train"
ちかてつ ; 地下鉄 ; subway
ふね ; 船 ; ship; boat
ひこうき ; 飛行機 ; airplane
よやく ; 予約 ; reservation
ツアー ; ; tour
どうぶつえん ; 動物園 ; zoo
じかん ; 時間 ; time
せかい ; 世界 ; world
びよういん ; 美容院 ; beauty parlor
てぶくろ ; 手袋 ; gloves
せいかつ ; 生活 ; life; living
ことし ; 今年 ; this year
あたたかい ; 暖かい ; warm
すずしい ; 涼しい ; cool (weather; not used for things)
つめたい ; 冷たい ; cold (things/people)
おそい ; 遅い ; slow; late
ねむい ; 眠い ; sleepy
かんたん ; 簡単 ; easy; simple
かかる ; (掛かる) ; to take (amount of time/money)
とまる ; 泊まる ; to stay (at a hotel, etc.) (～に)
なる ; ; to become
きめる ; 決める ; to decide (～を)
ごろごろする ; ; to chill out at home; to stay home and do nothing
りょこうする ; 旅行する ; to travel
れんしゅうする ; 練習する ; to practice (～を)
いちばん ; 一番 ; best
どっち ; ; which (of two), casual
どちら ; ; which (of two), more polite
はやく ; 早く ; (do something) early; fast
あるいて ; 歩いて ; on foot
～で ; ; by (means of transportation); with (a tool)
どうやって ; ; how; by what means
どのぐらい ; ; how much; how long
～しゅうかん ; ～週間 ; for ... weeks
～かげつ ; ～か月 ; for ... months
～ねん ; ～年 ; ... years
このごろ ; ; these days
～ご ; ～後 ; in ... time; after ...
～か～ ; ; or
`,
  11: `
がいこく ; 外国 ; foreign country
オーストラリア ; ; Australia
かわ ; 川 ; river
おんせん ; 温泉 ; spa; hot spring
つり ; (釣り) ; fishing
みずうみ ; 湖 ; lake
やま ; 山 ; mountain
キャンプ ; ; camp
ドライブ ; ; drive
じんじゃ ; 神社 ; shrine
びじゅつかん ; 美術館 ; art museum
しゃちょう ; 社長 ; president of a company
かしゅ ; 歌手 ; singer
ルームメイト ; ; roommate
ホストファミリー ; ; host family
しょうらい ; 将来 ; future
ゆめ ; 夢 ; dream
おまつり ; お祭り ; festival
おしょうがつ ; お正月 ; New Year's
おかし ; お菓子 ; snack; sweets
ビール ; ; beer
おもちゃ ; ; toy
こんがっき ; 今学期 ; this semester
らいがっき ; 来学期 ; next semester
じゅぎょう ; 授業 ; class
こちら ; ; this person (polite)
うそをつく ; ; to tell a lie
おなかがすく ; ; to become hungry
かう ; 飼う ; to own (a pet) (～を)
サボる ; ; to cut (classes) (～を)
とる ; 取る ; to take (a class); to get (a grade) (～を)
ならう ; 習う ; to learn (～を)
のぼる ; 登る ; to climb (place に)
はしる ; 走る ; to run
つかれる ; 疲れる ; to get tired
やめる ; (辞める) ; to quit (～を)
けんかする ; ; to have a fight; to quarrel (person と)
しょうかいする ; 紹介する ; to introduce (person に person を)
ダイエットする ; ; to go on a diet
ちこくする ; 遅刻する ; to be late (for an appointment) (～に)
りゅうがくする ; 留学する ; to study abroad (place に)
しゅっしん ; 出身 ; coming from (place の)
ひさしぶり ; 久しぶり ; it has been a long time
まあまあ ; ; okay; so-so
もっと ; ; more
あと ; 後 ; after (an event) (event の)
そして ; ; and then
～だけ ; ; just ...; only ...
～てん ; ～点 ; ... points
さっか ; 作家 ; writer
はいゆう ; 俳優 ; actor; actress
ジャーナリスト ; ; journalist
かんごし ; 看護師 ; nurse
けいさつかん ; 警察官 ; police officer
シェフ ; ; chef
しょうぼうし ; 消防士 ; firefighter
まんがか ; 漫画家 ; cartoonist
きょうし ; 教師 ; schoolteacher
けんきゅうしゃ ; 研究者 ; researcher
うちゅうひこうし ; 宇宙飛行士 ; astronaut
スポーツせんしゅ ; スポーツ選手 ; athlete
だいとうりょう ; 大統領 ; president of a country
`,
  12: `
おなか ; (お腹) ; stomach
あし ; 足 ; leg; foot
のど ; (喉) ; throat
は ; 歯 ; tooth
インフルエンザ ; ; influenza
かぜ ; 風邪 ; cold
せき ; (咳) ; cough
ふつかよい ; 二日酔い ; hangover
ホームシック ; ; homesickness
アレルギー ; ; allergy
ジュース ; ; juice
たまご ; 卵 ; egg
ふく ; 服 ; clothes
もの ; (物) ; thing (concrete object)
プレゼント ; ; present
きっぷ ; 切符 ; train ticket
～だい ; ～代 ; charge; fee
ようじ ; 用事 ; business to take care of
おてあらい ; お手洗い ; restroom
しあい ; 試合 ; match; game
せいじ ; 政治 ; politics
せいせき ; 成績 ; grade (on a test, etc.)
かのじょ ; 彼女 ; she; girlfriend
かれ ; 彼 ; he; boyfriend
かれし ; 彼氏 ; boyfriend
いみ ; 意味 ; meaning
せまい ; 狭い ; narrow; not spacious
ひろい ; 広い ; wide; spacious
わるい ; 悪い ; bad
いたい ; 痛い ; hurt; painful
あまい ; 甘い ; sweet
おおい ; 多い ; there are many ...
すてき ; 素敵 ; nice
あるく ; 歩く ; to walk
かぜをひく ; 風邪をひく ; to catch a cold
ねつがある ; 熱がある ; to have a fever
のどがかわく ; のどが渇く ; to become thirsty
はらう ; 払う ; to pay (～を)
なくす ; (無くす) ; to lose (～を)
きょうみがある ; 興味がある ; to be interested (in ...) (topic に)
せきがでる ; せきが出る ; to cough
わかれる ; 別れる ; to break up; to separate (person と)
きんちょうする ; 緊張する ; to get nervous
しんぱいする ; 心配する ; to worry
おだいじに ; お大事に ; Get well soon.
げんきがない ; 元気がない ; don't look well
できるだけ ; ; as much as possible
たぶん ; 多分 ; probably; maybe
もうすぐ ; ; very soon; in a few moments/days
はじめて ; 初めて ; for the first time
にさんにち ; 二三日 ; for two to three days
それに ; ; moreover, ...
おなじ ; 同じ ; same
`,
};
