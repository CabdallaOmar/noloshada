(() => {
  'use strict';

  const messages = {
    '25 daqiiqo ayaa lagu daray diiwaankaaga.': '25 minutes were added to your log.',
    '30 daqiiqo oo akhris ah': '30 minutes of reading', 'Akhris 20 daqiiqo': 'Read for 20 minutes',
    'Akhris iyo qoraal': 'Reading and writing', 'Cab biyo kugu filan': 'Drink enough water',
    'Caadada waa la tirtiray.': 'Habit deleted.', 'Cutubka 4': 'Chapter 4',
    'Diyaari tallaabooyinka xiga': 'Prepare the next steps', 'Dib-u-eegista waa la kaydiyey.': 'Weekly review saved.',
    'Faahfaahin kooban': 'A short note', 'Magacu ha yeesho ugu yaraan laba xaraf oo aan bannaanayn.': 'Use at least two non-space characters for your name.',
    'Furaha sirta ahi sax ma aha. Mar kale isku day.': 'Your password is incorrect. Please try again.',
    'Kulan diirad': 'Focus session', 'Pomodoro diirad': 'Focus Pomodoro',
    'Tallaabada xigta: dib u eegis': 'Next step: review',
    'Xogta la soo gelinayo ma beddeshaa xogta hadda jirta?': 'Replace your current data with the imported backup?',
    'Tusaale dashboard': 'Dashboard preview', 'Yoolka waa la tirtiray.': 'Goal deleted.', 'Wax ka beddel hawsha': 'Edit task',
    'Geli cinwaan hawleed oo aan bannaanayn.': 'Enter a task title.', 'Dhammaadku waa inuu ka dambeeyaa bilowga.': 'End time must be after start time.',
    'Geli waqtiga bilowga ka hor dhammaadka.': 'Enter a start time before the end time.', 'Geli magaca maaddada.': 'Enter a subject name.',
    'Geli magaca caadada.': 'Enter a habit name.', 'Geli magaca yoolka.': 'Enter a goal name.', 'Geli magacaaga.': 'Enter your name.',
    'Kaydintu way fashilantay; xogtii hore waa la hayey.': 'Saving failed; your previous data was kept.',
    'Kaydintu way fashilantay; xogta lama tirtirin.': 'Saving failed; your data was not deleted.',
    '24-saac': '24-hour', '7-dii maalmood ee u dambeeyey': 'Last 7 days', '7 MAALMOOD': '7 DAYS',
    'Abaalmarin maalinle ah': 'Daily habit', 'Akoon ma lihid?': 'Don’t have an account?', 'Akoon ma leedahay?': 'Already have an account?',
    'Akkoonka demo-ga ah wuxuu ku shaqeeyaa browser-kan oo keliya. Xogtaadu qalabkaaga ayay ku kaydsan tahay.': 'This demo account works only in this browser. Your data is stored on your device.',
    'Bilow bilaash': 'Get started free', 'Bilow diiradda': 'Start focus', 'Bilowga ugu wanaagsan wuxuu ka bilaabmaa hal tallaabo oo yar.': 'The best beginning starts with one small step.',
    'Bisha': 'Month', 'Bishaada, aragti fog': 'Your month at a glance', 'Beddel dark mode': 'Toggle dark mode', 'Beddel light mode': 'Toggle light mode',
    'Beddel raadinta ama shaandhaynta.': 'Change your search or filter.', 'Beddel muuqaalka': 'Change appearance', 'Beddel raadis ama shaandhayn kale.': 'Try a different search or filter.',
    'Calaamadee': 'Mark complete', 'Calaamadee hawsha': 'Mark task complete', 'Caado maalinle ah': 'Daily habit', 'Caado cusub ku dar': 'Add a new habit',
    'Caadooyinka': 'Habits', 'Caadooyinka maanta la qabtay': 'Habits completed today', 'Caadooyinka yaryar ee joogtada ahi waxay keenaan isbeddel weyn.': 'Small, consistent habits lead to big changes.',
    'Casharrada iyo imtixaannada waxaad ku dari kartaa qaybta hawlaha adigoo dooranaya “Waxbarasho”.': 'Add lessons and exams under tasks by choosing “Study”.',
    'Dhammaan xaaladaha': 'All statuses', 'Dhammaan hawlahaaga hal meel kaga maamul.': 'Manage all your tasks in one place.',
    'Dhammaan hawlaha la qorsheeyey': 'All planned tasks', 'Dhammaatay': 'Completed', 'Dark mode': 'Dark mode', 'Dejinta': 'Settings', 'Dejintaada': 'Your settings',
    'Dib u bilow': 'Reset', 'Dib u dhac': 'Overdue', 'Dib u dhacday': 'Overdue', 'Dib u eeg casharka biology-ga': 'Review the biology lesson',
    'Dib-u-eegista toddobaadka': 'Weekly review', 'Diirad': 'Focus', 'Diirad saar hal hawl, dabadeed naftaada nasasho sii.': 'Focus on one task, then give yourself a break.',
    'Diirad iyo waqti waxbarasho': 'Focus and study time', 'Diirad saar': 'Stay focused', 'Diiwaanka waxbarashada': 'Study log',
    'Diiwaangeli kulan markaad dhammayso.': 'Log a session when you finish.', 'Dooro maalin kale ama hawl cusub ku dar.': 'Choose another day or add a new task.',
    'Dooro sida dashboard-ku u ekaanayo': 'Choose how your dashboard looks', 'Email': 'Email', 'Eeg dhammaan →': 'View all →',
    'Eeg tusaalaha dashboard-ka': 'View the dashboard preview', 'Faahfaahin': 'Details', 'Fur saacadda diiradda →': 'Open focus timer →', 'Fur menu': 'Open menu',
    'Furaha sirta ah': 'Password', 'Furaha sirta ah waxaa lagu kaydiyaa qaab hash ah oo keliya.': 'Your password is stored only as a hash.',
    'Furaha sirta ah sax ma aha. Mar kale isku day.': 'Incorrect password. Please try again.', 'Ficillada xogta iyo kalfadhiga': 'Data and session actions',
    'Gal akoonka': 'Sign in', 'Gal akoonkaaga': 'Sign in to your account', 'Guudmar': 'Overview', 'Hadda waa la doortay': 'Currently selected',
    'Hawl ku dar': 'Add task', 'Hawl cusub': 'New task', 'Hawl yar oo dhammaatayba waa guul.': 'Every small completed task is a win.',
    'Hawsha kasta si cad u qor, si deggan u dhammee.': 'Write each task clearly and complete it calmly.', 'Hawsha waa la kaydiyey.': 'Task saved.',
    'Hawsha waa la cusboonaysiiyey.': 'Task updated.', 'Hawsha waa la tirtiray.': 'Task deleted.', 'Hawlaha': 'Tasks', 'Hawlaha aad dhamaysay maalin kasta': 'Tasks completed each day',
    'Hawlaha guud': 'Total tasks', 'Hawlaha oo dhan': 'All tasks', 'Hawlaha maanta': 'Today’s tasks', 'Hawlaha maalintan loo qorsheeyey': 'Tasks planned for this day',
    'Hawlaha qayb kasta': 'Tasks by category', 'Hawlo dib u dhacay': 'Overdue tasks', 'Hawlo, yoolal, caadooyin iyo qoraallo': 'Tasks, goals, habits, and notes',
    'Harsan': 'Remaining', 'Hadafyada bisha': 'Monthly goals', 'Horumar joogto ah': 'Steady progress', 'Horumarka la raadinayo': 'Progress toward your goals',
    'Horumarka maanta': 'Today’s progress', 'Horumarkaaga maanta': 'Your progress today', 'Horumarka toddobaadkaaga iyo guulaha ilaa hadda.': 'Your weekly progress and achievements so far.',
    'Horumarkaaga qor, guulahaagana la soco.': 'Write down your progress and track your wins.', 'Horumarka yoolka waa la cusboonaysiiyey.': 'Goal progress updated.',
    'Hubinaya server-ka...': 'Checking server…', 'Iimaylkaaga': 'Your email',  'Isniin': 'Monday', 'Isniin, 18 Oktoobar': 'Monday, October 18',
    'Joogteynta caadooyinka': 'Habit consistency', 'Joogteyntu waa awooddaada': 'Consistency is your strength', 'Joogtayn': 'Consistency', 'Joogtayntaada': 'Your consistency', 'JOOGTEYN': 'CONSISTENCY', 'JSON backup buuxa': 'Full JSON backup',
    'Abuur buttons kuu gaar ah, dabadeed active ka dhig markaad wax qabato.': 'Create your own buttons and activate them when you do the activity.', 'Buttons-ka aad abuurto adigaa go\'aamiya inta aad active ka dhigto.': 'You decide which of your buttons to keep active.',
    'Taabo tiro si aad active uga dhigto; buttons-ka 1 ilaa 100 waa kuu diyaar.': 'Tap a number to activate it; buttons 1 through 100 are ready for you.', 'Buttons-ka 1 ilaa 100 waad taaban kartaa si aad u toggle-garayso; kuwo kalena ku dar markaad rabto.': 'Tap any button from 1 to 100 to toggle it; add more whenever you want.',
    'Magaca button-ka': 'Button name', 'Magaca button-ka gaarka ah': 'Custom button name', 'Tusaale: Akhri 10 bog': 'Example: Read 10 pages', '+ Ku dar button': '+ Add button', 'Button-ka joogtaynta': 'Consistency button', 'Buttons-ka joogtaynta': 'Consistency buttons',
    '✓ Firfircoon': '✓ Active', '○ Damsan': '○ Inactive', 'Firfircoon': 'Active', 'Damsan': 'Inactive', 'Button weli ma jiro': 'No buttons yet', 'Foomka kore ku dar buttons-kaaga gaarka ah.': 'Add your own buttons using the form above.',
    'Geli magaca button-ka.': 'Enter a button name.', 'Button-ka waa lagu daray.': 'Button added.', 'Button-ka waa la tirtiray.': 'Button deleted.', 'Ma tirtirtaa button-kan?': 'Delete this button?', 'Tirtir button-kan': 'Delete this button',
    'Ka bax': 'Log out', 'Ka bax ↗': 'Log out ↗', 'Ka soo celi JSON backup': 'Restore from JSON backup', 'Kalfadhigan browser-ka ka xir': 'End this browser session',
    'Kaydi': 'Save', 'Kaydi dib-u-eegista': 'Save review', 'Kaydi hawsha': 'Save task', 'Kaydi profile-ka': 'Save profile', 'Kaydi qoraalka': 'Save note',
    'Kaydinta': 'Storage', 'Kaydso ama soo celi': 'Back up or restore', 'Kaydinta browser-ka lama heli karo. Fadlan ku fur server maxalli ah, dabadeed mar kale isku day.': 'Browser storage is unavailable. Open this through a local server and try again.',
    'Xogta account-ka cloud-ka waa la kaydinayaa...': 'Saving account data to the cloud...', 'Xogta account-ka cloud-ka waa la kaydiyey.': 'Account data is saved to the cloud.',
    'Xogtu qalabkan ayay ku kaydsan tahay; cloud-ku wuxuu sugayaa xiriir.': 'Your data is saved on this device and will sync when the cloud connection returns.',
    'Browser-ku ma kaydin karo nuqulka ku meel gaarka ah; sug inta cloud-ka laga xaqiijinayo.': 'The browser could not keep a temporary copy; wait for cloud confirmation.',
    'Kobac': 'Growth', 'Kulan kasta wuxuu ku darsamaa waqtiga maaddada aad doorato.': 'Each session adds time to the subject you choose.', 'Kulammadii maanta': 'Today’s sessions',
    'La dhammeeyey': 'Completed', 'La soco caadooyinka iyo yoolasha': 'Track your habits and goals', 'La soco maaddooyinka, waqtiga iyo horumarkaaga.': 'Track your subjects, time, and progress.',
    'Liiska hawlaha': 'Task list', 'Liiskaagu weli waa madhan': 'Your list is still empty', 'Light mode': 'Light mode', 'Maalinta koowaad ee usbuuca': 'First day of the week',
    'Maalintii hore': 'Previous day', 'Maalinta xigta': 'Next day', 'Maalintaadu way bannaan tahay': 'Your day is clear', 'Maalintan waxba ma jiraan': 'Nothing planned for this day',
    'Maamul yoolasha →': 'Manage goals →', 'Maareynta akoonka': 'Account management', 'Magaca dashboard-ku kuugu yeedhayo': 'Name shown on the dashboard', 'Magaca maaddada': 'Subject name',
    'Magacaaga': 'Your name', 'Maaddada waa lagu daray.': 'Subject added.', 'Maaddada waa la tirtiray.': 'Subject deleted.', 'Maxaad baratay ama ku faraxsan tahay maanta?': 'What did you learn or feel good about today?',
    'Maxaad qabanaysaa?': 'What are you working on?', 'Meesha aad wakhtiga gelisay': 'Where you spent your time', 'Milicsigaaga maalinlaha ah': 'Your daily reflection',
    'MUDNAANTA': 'PRIORITY', 'Muuji': 'Show', 'Muuji furaha': 'Show password', 'Muuqaalka': 'Appearance', 'Muuqaalka iftiinka ah': 'Light appearance', 'Muuqaalka mugdiga ah': 'Dark appearance',
    'Muujinta waqtiga hawlaha': 'Task time display', 'Nasasho': 'Break', 'Nasasho yar qaado oo neefso': 'Take a short break and breathe', 'Nasasho yar qaado!': 'Take a short break!',
    'Noocani waa demo browser-kaaga ku shaqeeya. Login ammaan ah wuxuu u baahan yahay backend.': 'This version is a browser demo. Secure sign-in requires a backend.',
    'Noocan demo-ga ah ma laha email dib-u-dejin. Akoon cusub samee ama gal qalabka aad ku diiwaangashanayd.': 'This demo does not support email password resets. Create an account or sign in on the device where you registered.',
    'Nuqul ka samee xogta qorshahaaga.': 'Create a copy of your planning data.', 'Nuqulka xogtaada waa la soo dejiyey.': 'Your data backup has been downloaded.',
     'POMODORO': 'POMODORO', 'Profile-ka': 'Profile',
    'Qaybta': 'Category', 'Qor waxa shaqeeyey iyo waxa aad rabto inaad hagaajiso.': 'Write what worked and what you want to improve.', 'Qoraal (ikhtiyaari)': 'Notes (optional)',
    'Qoraal weli ma jiro': 'No notes yet', 'Qoraalladii hore': 'Past notes', 'Qoraalka maanta': 'Today’s note', 'Qorshee si deggan': 'Plan calmly',
    'Qorshee usbuuca →': 'Plan your week →', 'Qorshee usbuuca': 'Plan your week', 'Qorshaha maanta': 'Today’s plan', 'Qorshahaaga maanta': 'Your plan for today',
    'Qorshahaaga u samee qorshe nololeed kuu gaar ah.': 'Create a life plan that works for you.', 'Qorshaha mashruuca': 'Project plan', 'Qorshee usbuuca': 'Plan your week',
    'Qor wax yar ka hor intaadan kaydin.': 'Write something before saving.', 'Qor waxa aad rabto inaad gaadho, dabadeed la soco horumarka.': 'Write what you want to achieve, then track your progress.',
    'Raadi hawlaha...': 'Search tasks…', 'Raadi hawl ama qayb...': 'Search tasks or categories…', 'Samee mid cusub': 'Create a new one', 'Samee qorshahaaga': 'Create your plan',
    'Soo dejiso xogtaada': 'Export your data', 'Soo deji': 'Export', 'Soo geli xog hore': 'Import existing data', 'Soo geli': 'Import', 'Soo celi xogta': 'Restore data',
    'Saaxiib': 'Friend', 'Sare': 'High', 'Shaqo': 'Work', 'Shakhsi': 'Personal', 'Qoys': 'Family', 'Caafimaad': 'Health', 'Waxbarasho': 'Study', 'Hawl': 'Task',
    'Tallaabo kasta waa horumar.': 'Every step is progress.', 'Tallaabo yar maanta, horumar weyn berri': 'A small step today, big progress tomorrow', 'Tirtir': 'Delete',
    'Tirtir dhammaan xogta': 'Delete all data', 'Tirtir xogta': 'Delete data', 'Toddobaadkan': 'This week', 'Toddobaadka': 'Week', 'Toddobaadkaaga': 'Your week',
    'Tusaale: Aamina': 'Example: Aamina', 'Wadarta hawlaha dhammaaday': 'Total completed tasks', 'WAQTIGA': 'TIME', 'Waqti aad si ula kac ah ugu qoondeysay': 'Time you set aside intentionally',
    'Waqti furan': 'Unscheduled', 'Waqti lama cayimin': 'Time not set', 'Waqti guud': 'General time', 'Waqtiga': 'Time', 'Waqtiga diiradda': 'Focus time', 'Waqtiga si xikmad leh u isticmaal': 'Use your time wisely',
    'Waqtigaaga diiradda saar': 'Focus on your work', 'Kulan weli ma jiro': 'No sessions yet', 'Diiwaangeli kulan markaad dhammayso.': 'Log a session when you finish.',
    'Hakad geli': 'Pause', 'Bilow diiradda': 'Start focusing', 'Maanta waa la qabtay': 'Done today', 'Caado maalinle ah': 'Daily habit',
    'Maalin kasta calaamadee caadooyinka aad qabatay.': 'Mark the habits you complete each day.', 'Caado cusub, tusaale: Socod 20 daqiiqo': 'New habit, e.g. Walk for 20 minutes',
    'Maalin kasta dib u bilow, kadibna calaamadee waxa aad qabatay.': 'Start fresh each day, then mark what you completed.',
    'Waqtiga waxbarashada maanta': 'Study time today', 'Waa inaad furaha sirta ah gelisaa.': 'Please enter your password.', 'Waa inaad iimaylka gelisaa.': 'Please enter your email.',
    'Wax dib u dhacay ma jiro': 'Nothing is overdue', 'Wax hawl ah lama helin': 'No tasks found', 'Wax natiijo ah lama helin': 'No results found', 'Waxaad ku socotaa jidka saxda ah': 'You are on the right track',
    'Waxaad ku socotaa jidka saxda ah.': 'You are on the right track.', 'Waxbarasho': 'Study', 'Waxbarashadaada': 'Your studies', 'Waxba kama beddelin': 'No changes made',
    'Wax-soo-saarka toddobaadkan': 'This week’s productivity', 'Yoolal': 'Goals', 'Yoolal & qoraal': 'Goals & journal', 'Yoolal iyo fikirro': 'Goals and reflections',
    'Yoolashaada': 'Your goals', 'Yoolal lama darin': 'No goals added', 'Yoolal bisha ma jiraan weli.': 'No goals for this month yet.', 'Yool cusub, tusaale: Buug akhri': 'New goal, e.g. read a book',
    'Yoolka waa lagu daray.': 'Goal added.', 'Yoolka waa la gaaray!': 'Goal achieved!', 'Xaaladda': 'Status',  'Xogtaadu qalabkaaga ayay ku kaydsan tahay': 'Your data is stored on your device',
    'Xogtu browser-kan ayay ku jirtaa': 'Your data is stored in this browser', 'Xogtu qalabkaaga ayay ku kaydsan tahay': 'Your data is stored on your device',
    'Xogta qorshahaaga waxaa lagu kaydiyaa server-ka account-kaaga; nuqul hore oo browser-ka ku jiray waxa la guuriyaa marka aad gasho.': 'Your plan is saved to your account server; any older browser copy is migrated when you sign in.', 'Yool shakhsi ah': 'Personal goal', 'Yoolkaaga ugu horreeya ku dar': 'Add your first goal', 'Yoolal lama helin': 'No goals found',
    'Akhri laba buug bishan': 'Read two books this month', 'Akhriska subaxnimo': 'Morning reading', 'Socod iyo nasasho': 'Walk and rest', 'Qorshee si deggan': 'Plan calmly',
    'Saaxiib': 'Friend', 'Muuji': 'Show', 'Qari': 'Hide', 'Beddel dark mode': 'Toggle dark mode', 'Bilowga': 'Start', 'Dhammaadka': 'End',
    'Taariikhda': 'Date', 'Mudnaanta': 'Priority', 'Dhexdhexaad': 'Medium', 'Hoose': 'Low', 'Furaha': 'Password', 'Magaca hawsha': 'Task name',
    'Iimaylkan horay ayuu u diiwaangashan yahay. Gal akoonkaaga.': 'This email is already registered. Please sign in.', 'Akoon iimaylkan leh lama helin. Marka hore samee akoon.': 'No account was found for this email. Please create an account first.',
    'Muuji furaha': 'Show password', 'Qari furaha': 'Hide password', 'Ma illowday?': 'Forgot password?', 'Ku soo laabo, sxb.': 'Welcome back.', 'Samee akoonkaaga.': 'Create your account.',
    'Ku soo dhowow': 'Welcome', 'Ku soo dhawow': 'Welcome', 'KU SOO DHAWOOW': 'WELCOME', 'MEEL KUU GAAR AH': 'A SPACE OF YOUR OWN', 'SAFARKAAGA WAA HALKAN': 'YOUR JOURNEY STARTS HERE',
    'Nolol kuu dhow': 'A life closer to', 'yoolalkaaga.': 'your goals.', 'Qorshahaaga': 'Your plan', 'dib uga bilow.': 'pick up where you left off.',
    'Waxyaabaha yaryar ee aad maanta qabato ayaa dhisa nolosha aad rabto berri.': 'The small things you do today build the life you want tomorrow.',
    'Abuur qorshe kuu shaqeeya oo ku caawiya inaad maskax deggan ku gaadho waxa muhiimka kuu ah.': 'Build a plan that works for you and helps you reach what matters with a calm mind.',
    'Geli faahfaahintaada si aad qorshahaaga u sii wadato.': 'Enter your details to continue your plan.', 'Samee akoon': 'Create account', 'Abuur akoon': 'Create account',
    'Ku bilow qorshe nololeed kuu gaar ah.': 'Start a life plan of your own.', 'Ugu yaraan 8 xaraf': 'At least 8 characters', 'Geli furaha sirta ah': 'Enter your password',
    'magac@example.com': 'name@example.com', 'Tusaale: Aamina': 'Example: Aamina', 'Furaha sirta ah sax ma aha. Mar kale isku day.': 'Incorrect password. Please try again.',
    'Bilow qorshahaaga': 'Start your plan', 'Hore ayaan u diiwaangashanahay': 'I already have an account', 'Bogga hore': 'Home page',
    'Qorshe cad. Maalin macno leh.': 'A clear plan. A meaningful day.', 'Waqtigaaga u beddel': 'Turn your time into', 'horumar muuqda.': 'visible progress.',
    'Noloshaada waxay isku keentaa hawlaha, waxbarashada, caadooyinka iyo yoolashaada—hal meel oo deggan oo kuu gaar ah.': 'Noloshaada brings your tasks, studies, habits, and goals together—in one calm space of your own.',
    'Xogtaadu qalabkaaga ayay ku kaydsan tahay': 'Your data stays on your device', 'hawlood': 'tasks', 'Dhammaan hawlaha': 'All tasks', 'Guudmar': 'Overview',
    'Xogtaadu account-kaaga cloud-ka ayay ku kaydsan tahay': 'Your data is securely stored in your cloud account',
    'Waa maalin cusub, fursad cusub.': 'A new day, a new opportunity.', 'Maalin cusub, fursad cusub.': 'A new day, a new opportunity.', 'Horumarka maanta': 'Today’s progress',
    'Hadafka toddobaadka: 72%': 'Weekly goal: 72%', 'Hawl baa dhammaatay': 'Task completed', 'Waxaad ku socotaa jidka saxda ah': 'You are on the right track',
    'Waa la dhammeeyey': 'Completed', 'Qorshe cad. Maalin macno leh.': 'A clear plan. A meaningful day.',
    'Dhammaan hawlahaaga hal meel kaga maamul.': 'Manage all your tasks in one place.', 'Dhammaan hawlaha': 'All tasks',
    'Noocan demo-ga ah ma laha email dib-u-dejin. Akoon cusub samee ama gal qalabka aad ku diiwaangashanayd.': 'This demo does not support email password resets. Create an account or sign in on the device where you registered.',
    'Muuqaalka mugdiga ah': 'Dark appearance', 'Muuqaalka iftiinka ah': 'Light appearance', 'Waqtiga bilowga': 'Start time',
    'Dhammaadka': 'End', 'Waqtiga diiradda saar': 'Focus time', 'Ka noqo': 'Cancel', 'Xir': 'Close', 'Bilow ama hakad geli': 'Start or pause', 'Dib u bilow': 'Restart',
    'Ma tirtirtaa maaddadan?': 'Delete this subject?', 'Ma tirtirtaa caadadan iyo diiwaankeeda?': 'Delete this habit and its history?', 'Ma tirtirtaa yoolkan?': 'Delete this goal?',
    'Tani waxay tirtiraysaa hawlaha, caadooyinka, yoolasha iyo qoraallada akoonkan. Ma sii wadaysaa?': 'This will delete the tasks, habits, goals, and notes in this account. Continue?',

    'Kaydintu way fashilantay. Hubi booska browser-ka.': 'Saving failed. Check your browser storage.', 'Hadda waa la doortay': 'Currently selected', 'Xogtii waa la soo geliyey.': 'Data imported.',
    'Faylka JSON-ka lama akhrin karo.': 'The JSON file could not be read.', 'Xogta qorshaha waa la nadiifiyey.': 'Planning data cleared.', 'Profile-ka waa la cusboonaysiiyey.': 'Profile updated.',
    'Maaddada waa lagu daray.': 'Subject added.', 'Caadada cusub waa la kaydiyey.': 'New habit saved.', 'Yoolka waa lagu daray.': 'Goal added.', 'Qoraalka maanta waa la kaydiyey.': 'Today’s note saved.',



    'Hubinaya server-ka...': 'Checking server…',
    'Waqtiga bilowga': 'Start time', 'Diirad saar hal hawl, dabadeed naftaada nasasho sii.': 'Focus on one task, then take a break.',
    'La soco waqtiyada muhiimka ah iyo yoolasha bisha.': 'Track important dates and goals for the month.', 'Bishaada, aragti fog': 'Your month at a glance',
    'Yoolka waa la gaaray.': 'Goal achieved.', 'Hambalyo, yoolka waa la gaaray!': 'Congratulations, you reached your goal!', 'Qorshe weli ma jiro': 'No plan yet',
    'Ku dar hawshaada ugu horreysa si aad u bilowdo.': 'Add your first task to get started.', 'Ku dar hawshaada koowaad si aad u qorshayso maalinta.': 'Add your first task to plan your day.',
    'Ku dar hawshaada koowaad si aad u bilowdo.': 'Add your first task to get started.', 'Ku dar caado kuu muhiim ah': 'Add a habit that matters to you',
    'Xogta toddobaadkaaga iyo guulaha ilaa hadda.': 'Your weekly data and achievements so far.', 'Waqtiga waxbarasho': 'Study time', 'Yoolal lama darin': 'No goals added', 'Sii wad!': 'Keep it up!', 'Fiid wanaagsan': 'Good evening', 'Galab wanaagsan': 'Good afternoon', 'Subax wanaagsan': 'Good morning',
    'Yoolasha bisha': 'Goals for the month', 'Sare': 'High', 'Hoose': 'Low', 'Dhexdhexaad': 'Medium', 'Saacadaha yoolka': 'Goal hours', 'Taariikhda yoolka': 'Goal date',
    'Kayd maxalli ah': 'Local storage', 'Kaydka server-ka': 'Server storage', 'Xogta server-ka account-ka ayaa lagu kaydiyaa': 'Your account data is stored on the server', 'SERVER': 'SERVER', 'LOCAL': 'LOCAL',  'QORSHEE': 'PLANNING', 'KOBAC': 'GROWTH', 'FALANQAYN': 'ANALYTICS', 'SHAQSI · QORSHAHAAGA': 'PERSONAL · YOUR PLAN',
    'WAQTIGA & MAAREYNTA': 'TIME & MANAGEMENT', 'QORSHE MAALINLE': 'DAILY PLAN', 'QORSHE TODDOBAADLE': 'WEEKLY PLAN', 'QORSHE BILLE': 'MONTHLY PLAN', 'LIISKA HAWLAHA': 'TASK LIST',
    'WAXBARASHO & KORRIIN': 'STUDY & GROWTH', 'JOOGTEYN & CAADO': 'CONSISTENCY & HABITS', 'YOOLAL & ISMILICSIGA': 'GOALS & REFLECTIONS', 'HORUMAR & FALANQAYN': 'PROGRESS & ANALYTICS',
    'AKOON & DOORASHOOYIN': 'ACCOUNT & PREFERENCES', 'MAALINTAADA': 'YOUR DAY', 'NOLOSHAADA · QORSHEE SI DEGGAN': 'NOLOSHAADA · PLAN CALMLY',
    'QORSHEE SI DEGGAN': 'PLAN CALMLY', 'Maalinta macno leh': 'A meaningful day', 'Bilow inaad qorshayso': 'Start planning', 'Dhammaan xaaladaha': 'All statuses',
    'Isku day raadis ama shaandhayn kale.': 'Try another search or filter.', 'Beddel raadinta ama shaandhaynta.': 'Change your search or filter.', 'Ku dar caado kuu muhiim ah': 'Add a habit that matters to you',
    'Tani waa demo frontend ah.': 'This is a frontend demo.', 'Ku soo laabo, sxb.': 'Welcome back.', 'Ku soo dhawow': 'Welcome', 'Ku soo dhawoow': 'Welcome',
    'AMA': 'OR', 'BILAASH · WAQTI KASTA': 'FREE · ANYTIME', 'Akkoonka demo-ga ah wuxuu ku shaqeeyaa browser-kan oo keliya. Xogtaadu qalabkaaga ayay ku kaydsan tahay.': 'This demo account works only in this browser. Your data stays on your device.',
    'Abuur akoon kuu gaar ah': 'Create your account', 'Furaha sirta ahi waa inuu ahaadaa ugu yaraan 8 xaraf.': 'Password must be at least 8 characters.',
    'Qorshe nololeed': 'Life planner', 'Hawlaha': 'Tasks', 'Hawsha': 'Task', 'Hadda ma jirto': 'None yet',
    '+ 25 daqiiqo': '+ 25 minutes', '+ Diiwaangeli 25 daqiiqo': '+ Log 25 minutes', '+ hawl ku dar': '+ add task', '＋ Ku dar caado': '＋ Add habit', '＋ Ku dar maaddo': '＋ Add subject', '＋ Ku dar yool': '＋ Add goal',
    '12-saac': '12-hour', 'Axad': 'Sunday', 'MAANTA': 'TODAY', 'HAWLAHA': 'TASKS', 'TAARIIKHDA': 'DATE', 'WAQTIGA': 'TIME',
    'Caadooyinka maanta la qabtay': 'Habits completed today', 'dhammaystir': 'completed', 'Dhammaan xaaladaha': 'All statuses', 'Dib u dhac': 'Overdue',
    'Ficillada xogta iyo kalfadhiga': 'Data and session actions', 'Hawlaha maalintan loo qorsheeyey': 'Tasks planned for this day', 'Hawlaha qayb kasta': 'Tasks by category',
    'Hawlo, yoolal, caadooyin iyo qoraallo': 'Tasks, goals, habits, and notes',  'Kulan kasta wuxuu ku darsamaa waqtiga maaddada aad doorato.': 'Each session adds time to the subject you choose.',
    'Kulammadii maanta': 'Today’s sessions', 'Maalinta koowaad ee usbuuca': 'First day of the week', 'MAANTA': 'TODAY', 'Nasasho': 'Break',
     'Qaabka qorshaha toddobaadka': 'Weekly plan layout', 'Qaabka saacadda': 'Clock format',





    'Raadi hawlaha': 'Search tasks', 'Toddobaad si fiican loo qorsheeyey': 'A well-planned week',
    'Galitaanku wuu dhacay; xogta browser-ka way ku jirtaa.': 'Your session expired; your browser data is still here.',
    'Xogtu browser-ka way ku jirtaa; server-ka lama sync-gareyn.': 'Your data is in this browser; it has not synced to the server.',
    'Galitaanku wuu dhacay. Dib u gal account-ka si xogta server-ka loo sync-gareeyo.': 'Your session expired. Sign in again to sync your data to the server.',
    'Xogta account-ka server-ka lama sync-gareyn. Hubi in server-ku shaqaynayo.': 'Account data could not sync to the server. Check that the server is running.',
    'Xogta account-ka server-ka waa la kaydiyey.': 'Account data has been saved to the server.',
    'Taariikhda ama waqtiga hawshu sax ma aha.': 'The task date or time is invalid.',

    'ilaa hadda': 'so far', 'Si fiican ayaad u socotaa. Sii wad!': 'You are making great progress. Keep going!',
    'Raadintaadu hawl ma helin.': 'Your search did not find any tasks.',
    'Fikir yar': 'A small thought',
    'Wax ka beddel': 'Edit',
    'Kulankan tirtir': 'Delete this session',
    'Adigu tirtir button-kan': 'Delete this button',
    'Adigu tirtir': 'Delete',
    'Tirtir qoraalkan': 'Delete this note',
    'Milicsigaaga koowaad halkan ayuu ka muuqan doonaa.': 'Your first reflection will appear here.',
    'Caadooyin lama darin': 'No habits added', 'Caadooyinkaaga': 'Your habits',
    'Ku dar tracker-ka caadooyinka.': 'Add habits to your tracker.',
    'Ku dar yoolal si aad u cabbirto horumarkaaga.': 'Add goals to track your progress.',
    'Kulanka waa la tirtiray.': 'Session deleted.', 'Qoraalka waa la tirtiray.': 'Note deleted.',
    'Nasashadu way dhammaatay. Diyaar ma u tahay wareeg kale?': 'Your break is over. Ready for another round?',
    'Waqtigii diiraddu wuu dhammaaday. Nasasho yar qaado!': 'Your focus time is over. Take a short break!',
    'Waxaad ku dari kartaa ugu badnaan 100 button oo gaar ah.': 'You can add up to 100 custom buttons.',
    'Galitaanku wuu dhacay; xogta cloud-ka lama sync-gareyn.': 'Your session expired; account data has not synced to the cloud.',
    'Xogtu cloud-ka lama sync-gareyn.': 'Your data has not synced to the cloud.',
    '✓ Dhammaatay': '✓ Completed',
    'Xogta account-kaaga waa la kaydiyaa': 'Your account data is being saved.',
    'Dib-u-eegista toddobaadka': 'Weekly review', 'Weli dhiman': 'Pending', 'La dhamaystiray': 'Completed',
    'Waqti lama cayimin': 'No time set', 'Waqti furan': 'Unscheduled',
    'Maaddo weli lama darin': 'No subjects added yet', 'Ku dar maaddo si aad waqtiga waxbarashada ula socoto.': 'Add a subject to track your study time.',
    'Waxaad samaysay horumar.': 'You are making progress.',
    'Xogta qorshaha waxaa backend-ka loogu kaydiyaa account kasta si gaar ah. Isticmaal export haddii aad rabto nuqul backup ah.': 'Your plan is saved separately for each account. Export your data if you want a backup.',
    'Qor waxa shaqeeyey iyo waxa aad rabto inaad hagaajiso.': 'Write what worked and what you want to improve.', 'Qoraal (ikhtiyaari)': 'Notes (optional)',
    'Qorshee usbuuca →': 'Plan your week →', 'Qorshahaaga': 'Your plan', 'Soo geli xog hore': 'Import existing data', 'Soo dejiso xogtaada': 'Export your data',
    'Tallaabo kasta waa horumar.': 'Every step is progress.', 'Wadarta hawlaha dhammaaday': 'Total completed tasks', 'Waqti aad si ula kac ah ugu qoondeysay': 'Time you set aside intentionally',
    'Xogtu browser-kan ayay ku jirtaa': 'Your data is stored in this browser',
    'Yoolal bisha ma jiraan weli.': 'No goals for this month yet.', 'Yoolashaada': 'Your goals', 'Waqtiga waxbarashada maanta': 'Study time today',
    'SUBAX WANAAGSAN, AAMINA': 'GOOD MORNING, AMINA', '08:00 — Waxbarasho': '08:00 — Study', '10:30 — Shaqo qoto dheer': '10:30 — Deep work', '13:00 — Caafimaad': '13:00 — Health',
    '✦   Joogteyntu waa awooddaada': '✦   Consistency is your strength', '3 maalmood oo xiriir ah': '3 days in a row', '4 wareeg ayaa kuu harsan': '4 cycles remaining',
    'NASASHO YAR': 'SHORT BREAK', 'Hadafka toddobaadka: 72%': 'Weekly goal: 72%', 'Hawl baa dhammaatay': 'Task completed',
    'Joogteyntu waxay ka muhiimsan tahay degdegga.': 'Consistency matters more than speed.', 'Arag horumarkaaga maalin kasta': 'See your progress every day',
    'Samee furaha sirta ah': 'Create a password', 'Ugu yaraan 8 xaraf. Furaha sirta ah waxaa lagu kaydiyaa qaab hash ah oo keliya.': 'At least 8 characters. Your password is stored only as a hash.',
    'Abuur qorshe kuu shaqeeya oo ku caawiya inaad maskax deggan ku gaadho waxa muhiimka kuu ah.': 'Build a plan that works for you and helps you calmly reach what matters most.',
    'Noocani waa demo browser-kaaga ku shaqeeya. Login ammaan ah wuxuu u baahan yahay backend.': 'This is a browser demo. Secure sign-in requires a backend.',
    'Ku bilow qorshe nololeed kuu gaar ah.': 'Start a life plan of your own.', 'Waxyaabaha yaryar ee aad maanta qabato ayaa dhisa nolosha aad rabto berri.': 'The small things you do today build the life you want tomorrow.',
    'Hadda ma jirto': 'None yet', 'Waqti furan': 'Unscheduled', 'Waqti lama cayimin': 'Time not set', 'Qorshee usbuuca': 'Plan your week', 'Hawl cusub': 'New task',

    'Hubi booska browser-ka.': 'Check browser storage.', 'Ma tirtirtaa maaddadan?': 'Delete this subject?', 'Ma tirtirtaa caadadan iyo diiwaankeeda?': 'Delete this habit and its history?',
    'Ma tirtirtaa yoolkan?': 'Delete this goal?', 'Tani waxay tirtiraysaa hawlaha, caadooyinka, yoolasha iyo qoraallada akoonkan. Ma sii wadaysaa?': 'This will delete the tasks, habits, goals, and notes in this account. Continue?',
    'Akkoonka demo-ga ah wuxuu ku shaqeeyaa browser-kan oo keliya. Xogtaadu qalabkaaga ayay ku kaydsan tahay.': 'This demo account works only in this browser. Your data is stored on your device.',
    'Abuur akoon': 'Create account', 'Samee mid cusub': 'Create a new one', 'Gal akoonka': 'Sign in', 'Ka noqo': 'Cancel', 'Xir': 'Close',
    'Tirtir dhammaan xogta': 'Delete all data', 'Tirtir xogta': 'Delete data', 'Dhammaadka': 'End', 'Bilowga': 'Start', 'Qaybta': 'Category', 'Magaca hawsha': 'Task name',
    'Furaha sirta ah sax ma aha. Mar kale isku day.': 'Incorrect password. Please try again.', 'Akoon iimaylkan leh lama helin. Marka hore samee akoon.': 'No account found for this email. Please create an account first.',
    'Iimaylkan horay ayuu u diiwaangashan yahay. Gal akoonkaaga.': 'This email is already registered. Please sign in.', 'Muuji': 'Show', 'Qari': 'Hide', 'Ma illowday?': 'Forgot password?',
    'Wakhtiga kama dambaysta ah:': 'Due:', 'Hal tallaabo mar kasta': 'One step at a time', 'Maalinta': 'Day', 'Yool shakhsi ah': 'Personal goal', 'Horumarka yoolka waa la cusboonaysiiyey.': 'Goal progress updated.',
    'Maxaa kuu qabsoomay toddobaadkan?': 'What went well this week?', 'Wax kasta oo maskaxdaada ku jira halkan ku qor...': 'Write whatever is on your mind here…',
    'Magaca maaddada': 'Subject name', 'Saacadaha yoolka': 'Goal hours', 'Taariikhda yoolka': 'Goal date', 'Diiwaangeli 25 daqiiqo': 'Log 25 minutes',
    'Dhammaan hawlaha la qorsheeyey': 'All planned tasks', 'dhammaan hawlaha la qorsheeyey': 'all planned tasks', 'caado oo aad la socoto': 'habits tracked',
    'Wadarta hawlaha dhammaaday': 'Total completed tasks', '7-dii maalmood ee u dambeeyey': 'Last 7 days', 'Mudnaanta': 'Priority', 'Xogtaadu qalabkaaga ayay ku kaydsan tahay': 'Your data is stored on your device',
    'Hawlahaaga hal meel ku habeey': 'Organize your tasks in one place',
    'Habee dashboard-ka oo ilaali xogtaada.': 'Customize your dashboard and protect your data.', 'Horumarka': 'Progress', 'Waqtiga & diiradda': 'Time & focus', '← Bogga hore': '← Home page', 'NOLOSHADA · 2026': 'NOLOSHAADA · 2026',
    '✦   Joogteyntu waa awooddaada': '✦   Consistency is your strength', 'Joogteyntu waa awooddaada': 'Consistency is your strength',
    'Password-kaaga sax ma aha. Mar kale isku day.': 'Incorrect password. Please try again.', 'Password-ka waa inuu ahaadaa ugu yaraan 8 xaraf.': 'Password must be at least 8 characters.', 'Weli ma jiro': 'None yet', 'Profile-ka waa la cusboonaysiiyey.': 'Profile updated.', 'Email dib-u-dejin': 'Password reset email',
    'Tusaale: Aamina': 'Example: Aamina', 'Ugu yaraan 8 xaraf': 'At least 8 characters', 'Furaha sirta ah waxaa lagu kaydiyaa qaab hash ah oo keliya.': 'Your password is stored only as a hash.',
    'Noloshaada — Qorshe nololeed': 'Noloshaada — Life planner', 'Noloshaada · Qorshe nololeed': 'Noloshaada · Life planner',
    '↑ Soo geli': '↑ Import', '↓ Soo deji': '↓ Export', 'daqiiqo': 'minutes', 'saac': 'hours', 'Maanta': 'Today'
  };

  const lowerMessages = new Map(Object.entries(messages).map(([so, en]) => [so.replace(/\s+/gu, ' ').trim().toLocaleLowerCase('so-SO'), en]));
  const dynamic = [
    [/^(\d+) \/ (\d+) hawlood$/i, '$1 / $2 tasks'],
    [/^(\d+) \/ (\d+) maanta$/i, '$1 / $2 today'],
    [/^(\d+) \/ (\d+) active maanta$/i, '$1 / $2 active today'],
    [/^(\d+)\s*% caadooyinka maanta$/i, '$1% of habits today'],
    [/^(\d+)% heerka dhammaystirka$/i, '$1% completion rate'],
    [/^Wakhtiga kama dambaysta ah: (.+)$/i, 'Due: $1'],
    [/^Iimayl: (.+)$/i, 'Email: $1'],
    [/^(\d+(?:\.\d+)?) \/ (\d+(?:\.\d+)?) saac$/i, '$1 / $2 hours'],
    [/^(\d+) ka mid ah (\d+) hawlood$/i, '$1 of $2 tasks'],
    [/^(\d+) hawlood oo dhammaatay usbuucan$/i, '$1 tasks completed this week'],
    [/^(\d+) caado oo maanta la qabtay$/i, '$1 habits completed today'],
    [/^(\d+) wareeg ayaa la dhammaystiray$/i, '$1 cycles completed'],
    [/^(\d+) hawlood bishan$/i, '$1 tasks this month'],
    [/^(\d+) yool ayaa lala socdaa$/i, 'Tracking $1 goals'],
    [/^(\d+) yool oo la gaaray$/i, '$1 goals achieved'],
    [/^(\d+) kulan oo maanta la qabtay$/i, '$1 sessions today'],
    [/^(\d+) kulan oo la diiwaangeliyey$/i, '$1 sessions logged'],
    [/^(\d+) hawlood$/, '$1 tasks'],
    [/^(\d+(?:\.\d+)?) \/ (\d+(?:\.\d+)?) saac oo la qorsheeyey$/, '$1 / $2 planned hours'],
    [/^(\d+(?:\.\d+)?) saac$/, '$1 hours'],
    [/^(\d+) daqiiqo$/, '$1 minutes'],
    [/^(\d+) dib u dhacay$/, '$1 overdue'],
    [/^(\d+)% la gaaray$/, '$1% reached'],
    [/^(\d+)% heerka dhammeystirka$/, '$1% completion rate'],
    [/^🔥 (\d+) maalmood$/, '🔥 $1 day streak'],
    [/^(\d+) harsan$/, '$1 remaining'],
    [/^(\d+) dhammaatay$/, '$1 completed'],
    [/^(\d+) waa dhammaatay$/, '$1 completed'],
    [/^(\d+) ka mid ah (\d+) hawlood$/i, '$1 of $2 tasks'],
    [/^Waa (.+)\. Aan si deggan ku bilowno\.$/, 'It is $1. Let’s get started calmly.'],
    [/^Subax wanaagsan, (.+)\.$/, 'Good morning, $1.'],
    [/^Galab wanaagsan, (.+)\.$/, 'Good afternoon, $1.'],
    [/^Fiid wanaagsan, (.+)\.$/, 'Good evening, $1.'],
    [/^MAALINTAADA · (\d{4})$/, 'YOUR DAY · $1'],
    [/^(.+) · (Sare|Dhexdhexaad|Hoose)$/, (match, category, priority) => {
      const categories = { 'Shaqo': 'Work', 'Waxbarasho': 'Study', 'Caafimaad': 'Health', 'Shakhsi': 'Personal', 'Qoys': 'Family', 'Hawl': 'Task' };
      const priorities = { 'Sare': 'High', 'Dhexdhexaad': 'Medium', 'Hoose': 'Low' };
      return categories[category] && priorities[priority] ? `${categories[category]} · ${priorities[priority]}` : match;
    }]
  ];

  let language = 'en';
  const originalText = new WeakMap();
  const originalAttributes = new WeakMap();
  const originalTitle = document.title;
  const titleMessages = {
    'Noloshaada — Qorshe nololeed': 'Noloshaada — Life Planner',
    'Dashboard — Noloshaada': 'Dashboard — Noloshaada',
    'Gal akoonka — Noloshaada': 'Sign in — Noloshaada',
    'Samee akoon — Noloshaada': 'Create account — Noloshaada'
  };

  function translate(source) {
    const clean = source.trim();
    if (!clean) return source;
    const normalized = clean.replace(/\s+/gu, ' ');
    let result = messages[clean] || messages[normalized] || lowerMessages.get(normalized.toLocaleLowerCase('so-SO'));
    if (!result) {
      for (const [pattern, replacement] of dynamic) {
        const match = clean.match(pattern);
        if (match) { result = typeof replacement === 'function' ? replacement(...match) : clean.replace(pattern, replacement); break; }
      }
    }
    if (!result) return source;
    if (clean === clean.toLocaleUpperCase('so-SO')) result = result.toLocaleUpperCase('en-US');
    else if (clean[0] === clean[0].toLocaleUpperCase('so-SO')) result = result[0].toLocaleUpperCase('en-US') + result.slice(1);
    return source.replace(clean, result);
  }

  function protectedText(node) {
    const parent = node.parentElement;
    return !parent || parent.closest('script, style, textarea, [data-i18n-skip], .task-copy b, .week-task b, .calendar-mark, .month-goal span, .goal-card h3, .habit-card h3, .subject-card h3, .goal-progress > span, .journal-entry p');
  }

  function applyText(node) {
    if (protectedText(node)) return;
    if (!originalText.has(node)) originalText.set(node, node.nodeValue);
    const source = originalText.get(node);
    const next = language === 'en' ? translate(source) : source;
    if (node.nodeValue !== next) node.nodeValue = next;
  }

  const translatableAttributes = ['placeholder', 'title', 'aria-label', 'alt'];
  function applyAttributes(element) {
    if (element.matches('[data-i18n-skip]')) return;
    let saved = originalAttributes.get(element);
    if (!saved) { saved = new Map(); originalAttributes.set(element, saved); }
    for (const name of translatableAttributes) {
      if (!element.hasAttribute(name)) continue;
      if (!saved.has(name)) saved.set(name, element.getAttribute(name));
      const source = saved.get(name);
      const next = language === 'en' ? translate(source) : source;
      if (element.getAttribute(name) !== next) element.setAttribute(name, next);
    }
  }

  function visit(root) {
    if (root.nodeType === Node.TEXT_NODE) { applyText(root); return; }
    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;
    if (root.nodeType === Node.ELEMENT_NODE) applyAttributes(root);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) applyText(node);
    if (root.querySelectorAll) root.querySelectorAll('*').forEach(applyAttributes);
  }

  function getLocale() { return language === 'en' ? 'en-US' : 'so-SO'; }
  window.NoloshaI18n = { getLanguage: () => language, getLocale, translate };

  document.documentElement.lang = 'en';
  visit(document);
  document.title = titleMessages[originalTitle] || originalTitle;

  const observer = new MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'characterData') applyText(record.target);
      else {
        record.addedNodes.forEach(node => visit(node));
        if (record.type === 'attributes') applyAttributes(record.target);
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: translatableAttributes });

})();
