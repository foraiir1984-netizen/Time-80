# راهنمای کدهای رابط Time80

نسخهٔ registry: RC3-ID-01-Rev04
مرجع: RC3_UI_Identifiers_Reference_Rev01.md + الحاقیهٔ ۶-ب / RC3_UI_Identifiers_Addendum_6B_Rev01.md. اتصال این خروجی به commit تحویل و snapshot آزمون در گزارش RC3_UI_REPORT_01_Report_Rev01_FA.md ثبت است.

این خروجی از src/components/uiIdentifiers.ts تولید می‌شود. شماره‌ها از ترتیب این جدول تولید نمی‌شوند. «فعال» وضعیت تخصیص است؛ پذیرش نمایش در هر محل، به جدول پوشش و شاهد اجرای همان محل وابسته است.

در گزارش باگ، کد صفحه/پنجره و کنترل را کنار هم بنویسید. برای کنترل تکراری، نام فعالیت یا تاریخ/بازه نیز لازم است. نمونهٔ مسیر مورد درخواست محصول: A02/X17 → A02/D01/X19 → A02/D02/X30؛ این مثال به‌تنهایی شاهد پیاده‌سازی آن مسیر در این checkpoint نیست.

| کد | کلید ثابت | نام فارسی | اثر | نوع | وضعیت | محل‌های استفاده |
| --- | --- | --- | --- | --- | --- | --- |
| A01 | today | امروز | نمای اصلی امروز، ساعت و مسیرهای ثبت/مرور | screen | فعال | src/components/TodayOverview.tsx:49 (IdentifierTitle.code) |
| A02 | activities | فعالیت‌ها | گرید مدیریت؛ فعال/بایگانی فیلتر همین صفحه است | screen | فعال | src/screens/ActivitiesScreen.tsx:106 (IdentifierTitle.code) |
| A03 | timeReport | گزارش زمان | هشت حالت بازه؛ M-01 و M-04 بخش‌های همین صفحه‌اند | screen | فعال | src/screens/InsightsScreen.tsx:126 (IdentifierTitle.code) |
| A04 | reminderSettings | تنظیمات یادآوری | ویرایش تنظیمات موجود و ورود به بررسی اعلان | screen | فعال | src/screens/SettingsScreen.tsx:97 (IdentifierTitle.code)؛ src/screens/SettingsScreen.tsx:111 (IdentifierTitle.code) |
| A05 | dayTimeline | مرور روز / خط زمان | نمای review=true در همان کامپوننت؛ route مستقل ندارد | screen | فعال | src/screens/TodayScreen.tsx:101 (IdentifierTitle.code) |
| A06 | checkIn | ثبت و مشاهدهٔ بازه | ثبت تازه، مشاهده، ویرایش و بازه ردشده؛ کد ثابت | screen | فعال | App.tsx:80 (stackPageCodes.CheckIn)؛ src/screens/CheckInScreen.tsx:141 (IdentifierTitle.code)؛ src/screens/CheckInScreen.tsx:342 (IdentifierTitle.code) |
| A07 | saveResult | نتیجهٔ ثبت | نتیجه، شمارش همان روز، Undo و مشاهده ثبت | screen | فعال | App.tsx:82 (stackPageCodes.SaveResult)؛ src/screens/SaveResultScreen.tsx:48 (IdentifierTitle.code) |
| A08 | backlog | بازه‌های ثبت‌نشده | فهرست عمومی یا محدود به dayScope | screen | فعال | App.tsx:81 (stackPageCodes.Backlog)؛ src/screens/BacklogScreen.tsx:56 (IdentifierTitle.code) |
| A09 | notificationDiagnostics | بررسی اعلان‌ها | مجوزها، capabilityها، تست و هماهنگ‌سازی | screen | فعال | App.tsx:84 (stackPageCodes.Diagnostics)؛ src/screens/NotificationDiagnosticsScreen.tsx:124 (IdentifierTitle.code) |
| A10 | notificationResolution | بازهٔ اعلان مشخص نیست | دلیل عدم تعیین بازه؛ انتخاب دستی یا بازگشت امروز | screen | فعال | App.tsx:83 (stackPageCodes.NotificationResolution)؛ src/screens/NotificationResolutionScreen.tsx:11 (IdentifierTitle.code) |
| A11 | onboarding | شروع کار | فعال‌کردن یادآوری یا ادامه بدون اعلان | screen | فعال | src/screens/OnboardingScreen.tsx:45 (IdentifierTitle.code) |
| A12 | bootstrap | آماده‌سازی برنامه | راه‌اندازی و خطای اولیه؛ تلاش مجدد | screen | فعال | App.tsx:397 (IdentifierTitle.code) |
| D01 | activityManagementDialog | گزینه‌های مدیریت فعالیت | Bottom Sheet واقعی با Modal؛ ویرایش، بایگانی یا بازگردانی | dialog | فعال | src/screens/ActivitiesScreen.tsx:327 (IdentifierTitle.code) |
| D02 | activityEditorDialog | فرم فعالیت جدید / ویرایش فعالیت | فرم مشترک با دو حالت؛ ایجاد/به‌روزرسانی کدهای جدا | dialog | فعال | src/components/ActivityEditor.tsx:139 (IdentifierTitle.code) |
| D03 | classificationDialog | انتخاب دستهٔ ICATUS | انتخاب اختیاری، جست‌وجو و سلسله‌مراتب؛ رابط حذف شده؛ Deferred/Reserved | dialog | رزرو | — |
| D04 | unsavedSettingsDialog | ویرایش ذخیره‌نشده | ادامه ویرایش یا کنارگذاشتن تغییر ناقص هنگام beforeRemove | dialog | فعال | src/screens/SettingsScreen.tsx:49 (identifierAlert.title) |
| D05 | changeEntryDialog | تأیید تغییر ثبت | تأیید تغییر فعالیت ثبت موجود؛ سیاست دادهٔ سرویس محفوظ است | dialog | فعال | src/screens/CheckInScreen.tsx:119 (identifierAlert.title) |
| D06 | confirmTimezoneDialog | تأیید منطقهٔ زمانی | تأیید context زمانی ثبت | dialog | فعال | src/screens/CheckInScreen.tsx:250 (identifierAlert.title) |
| D07 | skipSlotDialog | تأیید ردکردن بازه | ردکردن بازه یا انصراف | dialog | فعال | src/screens/CheckInScreen.tsx:313 (identifierAlert.title) |
| D08 | moreReportsDialog | Bottom Sheet بیشتر گزارش | حالت‌های موجود منتقل‌شده، تقویم، شروع هفته و ورودی custom؛ بازشدن خودش query را تغییر نمی‌دهد | dialog | فعال | src/components/ReportRangeControls.tsx:207 (IdentifierTitle.code) |
| X01 | selectTodayTab | تب امروز | انتخاب تب Today | action | فعال | App.tsx:144 (Tabs.Screen.options) |
| X02 | selectActivitiesTab | تب فعالیت‌ها | انتخاب تب Activities | action | فعال | App.tsx:155 (Tabs.Screen.options) |
| X03 | selectInsightsTab | تب گزارش | انتخاب تب Insights | action | فعال | App.tsx:165 (Tabs.Screen.options) |
| X04 | selectSettingsTab | تب تنظیمات | انتخاب تب Settings | action | فعال | App.tsx:176 (Tabs.Screen.options) |
| X05 | navigateBack | بازگشت به صفحهٔ قبلی | بازگشت پشته؛ مقصد وابسته به مسیر ورود | action | فعال | src/screens/CheckInScreen.tsx:196 (Button.actionCode)؛ src/screens/CheckInScreen.tsx:280 (Button.actionCode)؛ src/components/Ui.tsx:291 (Button.actionCode) |
| X06 | openSelectedSlot | بازکردن بازهٔ انتخاب‌شده | navigate("CheckIn") با زمان/context همان بازه؛ آینده غیرفعال | action | فعال | src/components/SlotRow.tsx:77 (IdentifierBadge.code) |
| X07 | completePendingSlot | تکمیل آخرین بازهٔ ثبت‌نشده | بازکردن pending انتخاب‌شده در A06؛ items.find نخستین واجد شرط را انتخاب می‌کند؛ نام و منطق فعلی حفظ شوند | action | فعال | src/screens/TodayScreen.tsx:153 (Button.actionCode)؛ src/components/TodayOverview.tsx:143 (Button.actionCode) |
| X08 | openTodayTimeline | مرور امروز / خط زمان | setReview(true)؛ A05 | action | فعال | src/components/TodayOverview.tsx:151 (Button.actionCode) |
| X09 | returnToTodayOverview | بازگشت به نمای اصلی امروز | تاریخ امروز و review=false؛ A01 | action | فعال | src/screens/TodayScreen.tsx:91 (Button.actionCode) |
| X10 | previousTimelineDay | روز قبل در خط زمان | یک روز کاهش تاریخ و فعال‌کردن مرور | action | فعال | src/screens/TodayScreen.tsx:119 (Button.actionCode) |
| X11 | currentTimelineDay | امروز در خط زمان | فقط تاریخ امروز؛ review تغییر نمی‌کند | action | فعال | src/screens/TodayScreen.tsx:130 (Button.actionCode) |
| X12 | nextTimelineDay | روز بعد در خط زمان | یک روز افزایش تاریخ؛ در امروز غیرفعال | action | فعال | src/screens/TodayScreen.tsx:136 (Button.actionCode) |
| X13 | openGeneralBacklog | بازه‌های ثبت‌نشدهٔ روزهای قبل | navigate("Backlog") بدون scope؛ A08 | action | فعال | src/screens/TodayScreen.tsx:160 (Button.actionCode) |
| X14 | createActivity | افزودن فعالیت | بازکردن D02 با activity=null | action | فعال | src/screens/ActivitiesScreen.tsx:113 (Button.actionCode)؛ src/screens/ActivitiesScreen.tsx:229 (Button.actionCode) |
| X15 | showArchivedActivities | دیدن بایگانی‌شده‌ها | تغییر فیلتر به بایگانی | action | فعال | src/screens/ActivitiesScreen.tsx:122 (Button.actionCode)؛ src/screens/ActivitiesScreen.tsx:221 (Button.actionCode) |
| X16 | showActiveActivities | دیدن فعال‌ها | تغییر فیلتر به فعال | action | فعال | src/screens/ActivitiesScreen.tsx:121 (Button.actionCode)؛ src/screens/ActivitiesScreen.tsx:220 (Button.actionCode) |
| X17 | openActivityManagement | گزینه‌های مدیریت فعالیت | بدنه کارت و سه‌نقطه هر دو D01 همان فعالیت را باز می‌کنند | action | فعال | src/screens/ActivitiesScreen.tsx:174 (IdentifierBadge.code)؛ src/screens/ActivitiesScreen.tsx:199 (IdentifierBadge.code) |
| X18 | closeSelectionDialog | بستن پنجره بدون انتخاب تازه | بستن D01 یا D08 بدون commit/انتخاب تازه؛ انتخاب قبلاً اعمال‌شده rollback نمی‌شود؛ D03 رزرو است | action | فعال | src/screens/ActivitiesScreen.tsx:305 (IdentifierBadge.code)؛ src/screens/ActivitiesScreen.tsx:371 (Button.actionCode)؛ src/components/ReportRangeControls.tsx:186 (IdentifierBadge.code)؛ src/components/ReportRangeControls.tsx:214 (ReportButton.actionCode) |
| X19 | editActivity | ویرایش فعالیت | بستن D01 و بازکردن D02 برای فعالیت موجود | action | فعال | src/screens/ActivitiesScreen.tsx:347 (Button.actionCode) |
| X20 | archiveActivity | بایگانی فعالیت | archiveActivity، بستن پنجره، تازه‌سازی | action | فعال | src/screens/ActivitiesScreen.tsx:358 (Button.actionCode) |
| X21 | restoreArchivedActivity | بازگردانی فعالیت بایگانی‌شده | restoreActivity؛ بازگردانی پایدار | action | فعال | src/screens/ActivitiesScreen.tsx:333 (Button.actionCode) |
| X22 | undoActivityArchive | واگرد بایگانی | undoActivityArchive با token و مهلت موجود | action | فعال | src/screens/ActivitiesScreen.tsx:252 (Button.actionCode) |
| X23 | retryActivitiesRead | تلاش دوباره برای فهرست فعالیت‌ها | load | action | فعال | src/screens/ActivitiesScreen.tsx:240 (Button.actionCode) |
| X24 | toggleIconPicker | بازکردن / جمع‌کردن انتخاب آیکون | تغییر picker درون D02؛ پنجره مستقل نیست | action | فعال | src/components/ActivityEditor.tsx:168 (Button.actionCode) |
| X25 | keepExistingIcon | نگه‌داشتن آیکون قبلی | draft به فرمان keep | action | فعال | src/components/ActivityEditor.tsx:176 (Button.actionCode) |
| X26 | selectAssetIcon | انتخاب آیکون منتخب | draft به selectAsset؛ هنوز ذخیره نمی‌کند | action | فعال | src/components/ActivityEditor.tsx:207 (IdentifierBadge.code) |
| X27 | selectLegacyIcon | انتخاب آیکون قدیمی یا واردشده | draft به selectLegacy(raw) | action | فعال | src/components/ActivityEditor.tsx:229 (Button.actionCode)؛ src/components/ActivityEditor.tsx:258 (IdentifierBadge.code) |
| X28 | cancelActivityEditor | انصراف از فرم فعالیت | بستن D02 و کنارگذاشتن draft؛ محدودیت busy محفوظ | action | فعال | src/components/ActivityEditor.tsx:285 (Button.actionCode) |
| X29 | saveNewActivity | ذخیرهٔ فعالیت جدید | saveActivity(null,…)؛ ایجاد سپس بستن | action | فعال | src/components/ActivityEditor.tsx:277 (Button.actionCode) |
| X30 | saveActivityEdit | ذخیرهٔ ویرایش فعالیت | saveActivity(id,…) با snapshot؛ به‌روزرسانی سپس بستن | action | فعال | src/components/ActivityEditor.tsx:276 (Button.actionCode) |
| X31 | retryActivityEditorRead | تلاش دوباره برای بارگذاری فرم | خواندن snapshot فعالیت و metadata آیکون | action | فعال | src/components/ActivityEditor.tsx:147 (Button.actionCode) |
| X32 | openClassificationPicker | بازکردن انتخاب دسته | بازکردن D03 و بازنشانی جست‌وجو/سطح؛ Deferred/Reserved | action | رزرو | — |
| X33 | selectClassification | انتخاب دسته | onChange(code) و بستن D03؛ draft فراخواننده؛ Deferred/Reserved | action | رزرو | — |
| X34 | clearClassification | بدون دسته | onChange(null) و بستن D03؛ Deferred/Reserved | action | رزرو | — |
| X35 | classificationParent | سطح بالاتر دسته | والد در همان پنجره؛ Deferred/Reserved | action | رزرو | — |
| X36 | classificationChildren | جزئیات دسته | فرزندان و پاک‌کردن جست‌وجو؛ Deferred/Reserved | action | رزرو | — |
| X37 | openClassificationDefinition | تعریف رسمی دسته | URL منبع رسمی با کد دسته؛ Deferred/Reserved | action | رزرو | — |
| X38 | cancelConfirmation | انصراف از تأیید | بستن D05/D06/D07 بدون تأیید عملیات | action | فعال | src/screens/CheckInScreen.tsx:125 (identifierAlert.actionCode)؛ src/screens/CheckInScreen.tsx:256 (identifierAlert.actionCode)؛ src/screens/CheckInScreen.tsx:319 (identifierAlert.actionCode) |
| X39 | commitNewCheckIn | ثبت یک‌لمسی فعالیت | commitCheckIn؛ پس از موفقیت replace با A07 | action | فعال | src/screens/CheckInScreen.tsx:369 (ActivityGrid.actionCode)؛ src/components/ActivityGrid.tsx:14 (shared component default) |
| X40 | requestCheckInChange | انتخاب فعالیت جایگزین | بازکردن D05؛ هنوز write ندارد | action | فعال | src/screens/CheckInScreen.tsx:368 (ActivityGrid.actionCode) |
| X41 | saveClassificationChange | ذخیرهٔ تغییر دسته | درخواست تغییر دسته همان فعالیت؛ D05؛ Deferred/Reserved | action | رزرو | — |
| X42 | confirmCheckInChange | تأیید تغییر ثبت | save(a) و commit؛ تغییر موفق به A07 | action | فعال | src/screens/CheckInScreen.tsx:130 (identifierAlert.actionCode) |
| X43 | editCheckIn | ویرایش ثبت | حالت ویرایش در A06 | action | فعال | src/screens/CheckInScreen.tsx:275 (Button.actionCode) |
| X44 | retrySelectedCheckIn | تلاش دوباره برای ثبت انتخابی | commit مجدد انتخاب ناموفق؛ guard موجود محفوظ | action | فعال | src/screens/CheckInScreen.tsx:181 (Button.actionCode) |
| X45 | reopenSkippedSlot | ثبت فعالیت برای بازهٔ ردشده | setReopened(true)؛ انتخاب فعالیت بدون write | action | فعال | src/screens/CheckInScreen.tsx:191 (Button.actionCode) |
| X46 | requestSkipSlot | درخواست ردکردن بازه | بازکردن D07 | action | فعال | src/screens/CheckInScreen.tsx:310 (Button.actionCode) |
| X47 | confirmSkipSlot | تأیید ردکردن بازه | skipSlot(slotId) سپس بازگشت | action | فعال | src/screens/CheckInScreen.tsx:323 (identifierAlert.actionCode) |
| X48 | inheritActivityClassification | استفاده از پیش‌فرض فعالیت | draft طبقه‌بندی mode="inherit"؛ Deferred/Reserved | action | رزرو | — |
| X49 | requestTimezoneConfirmation | درخواست تأیید منطقهٔ ثبت | بازکردن D06 | action | فعال | src/screens/CheckInScreen.tsx:246 (Button.actionCode) |
| X50 | confirmEntryTimezone | تأیید منطقهٔ زمانی ثبت | confirmTimeContext(ctx,zone) و بارگذاری مجدد | action | فعال | src/screens/CheckInScreen.tsx:260 (identifierAlert.actionCode) |
| X51 | retryCheckInRead | تلاش مجدد برای بارگذاری ثبت | خواندن context و فعالیت‌ها؛ بدون commit | action | فعال | src/screens/CheckInScreen.tsx:348 (Button.actionCode) |
| X52 | retryRemainingCount | تلاش دوباره برای شمارش | فقط getDayRemaining؛ ثبت دوباره اجرا نمی‌شود | action | فعال | src/screens/SaveResultScreen.tsx:76 (Button.actionCode) |
| X53 | openSameDayBacklog | مرور باقی‌مانده‌های همان روز | replace("Backlog",{dayScope:scope})؛ A08 | action | فعال | src/screens/SaveResultScreen.tsx:90 (Button.actionCode) |
| X54 | undoEntryEdit | بازگردانی تغییر ثبت | undoEntryEdit سپس replace("CheckIn") با همان بازه/scope؛ شکست موجود محفوظ | action | فعال | src/screens/SaveResultScreen.tsx:99 (Button.actionCode) |
| X55 | viewSavedEntry | مشاهدهٔ ثبت | جایگزینی A07 با A06 همان بازه | action | فعال | src/screens/SaveResultScreen.tsx:123 (Button.actionCode) |
| X56 | returnToMainToday | تمام / بازگشت به امروز | navigate("Main",{screen:"Today"}) | action | فعال | src/screens/NotificationResolutionScreen.tsx:35 (Button.actionCode)؛ src/screens/SaveResultScreen.tsx:130 (Button.actionCode) |
| X57 | selectDueSlot | انتخاب از بازه‌های سررسیدشده | replace("Backlog") بدون scope؛ A08 | action | فعال | src/screens/NotificationResolutionScreen.tsx:30 (Button.actionCode) |
| X58 | retryBacklogRead | تلاش دوباره برای بازه‌های ثبت‌نشده | load(true)؛ بازنشانی cursor و خواندن فهرست | action | فعال | src/screens/BacklogScreen.tsx:77 (Button.actionCode) |
| X59 | toggleReminders | فعال / غیرفعال‌کردن یادآوری | ذخیره notification_enabled؛ در فعال‌سازی درخواست مجوز موجود | action | فعال | src/screens/SettingsScreen.tsx:118 (CodedSwitch.actionCode) |
| X60 | editReminderInterval | ویرایش و ذخیرهٔ فاصله | draft تایپ؛ ذخیره مقدار تغییرکرده روی onBlur | action | فعال | src/screens/SettingsScreen.tsx:128 (Input.actionCode) |
| X61 | editDayStart | ویرایش و ذخیرهٔ شروع روز | draft و ذخیره onBlur | action | فعال | src/screens/SettingsScreen.tsx:141 (Input.actionCode) |
| X62 | editDayEnd | ویرایش و ذخیرهٔ پایان روز | draft و ذخیره onBlur | action | فعال | src/screens/SettingsScreen.tsx:152 (Input.actionCode) |
| X63 | toggleActiveDay | تغییر روز فعال | افزودن/حذف از active_days و ذخیره | action | فعال | src/screens/SettingsScreen.tsx:176 (Button.actionCode) |
| X64 | toggleSound | تغییر صدا | ذخیره sound_enabled | action | فعال | src/screens/SettingsScreen.tsx:192 (CodedSwitch.actionCode) |
| X65 | toggleVibration | تغییر لرزش | ذخیره vibration_enabled | action | فعال | src/screens/SettingsScreen.tsx:199 (CodedSwitch.actionCode) |
| X66 | openNotificationDiagnostics | بررسی اعلان‌ها | ورود A09 | action | فعال | src/screens/SettingsScreen.tsx:206 (Button.actionCode) |
| X67 | continueSettingsDraft | ادامهٔ ویرایش | بستن D04 و ماندن در ویرایش | action | فعال | src/screens/SettingsScreen.tsx:55 (identifierAlert.actionCode) |
| X68 | discardIncompleteSettingsDraft | کنارگذاشتن تغییر ناقص | همان navigation action متوقف‌شده اجرا شود؛ ذخیره‌های قبلی برنمی‌گردند | action | فعال | src/screens/SettingsScreen.tsx:59 (identifierAlert.actionCode) |
| X69 | requestNotificationPermission | درخواست مجوز اعلان | ensureNotificationPermission و خواندن مجدد diagnostics | action | فعال | src/screens/NotificationDiagnosticsScreen.tsx:185 (Button.actionCode) |
| X70 | openPhoneNotificationSettings | بازکردن تنظیمات گوشی | Linking.openSettings؛ مدیریت خطا/refresh FIX02 محفوظ | action | فعال | src/screens/NotificationDiagnosticsScreen.tsx:201 (Button.actionCode) |
| X71 | sendTestNotification | اعلان آزمایشی در ۱۰ ثانیه | همان sendTestNotification | action | فعال | src/screens/NotificationDiagnosticsScreen.tsx:206 (Button.actionCode)؛ src/screens/OnboardingScreen.tsx:60 (Button.actionCode) |
| X72 | reconcileNotificationsManually | هماهنگ‌سازی مجدد اعلان | reconcileNotifications("manual") و خواندن diagnostics | action | فعال | src/screens/NotificationDiagnosticsScreen.tsx:211 (Button.actionCode) |
| X73 | enableOnboardingReminders | فعال‌کردن یادآوری در شروع کار | مجوز، فعال‌سازی تنظیم، reconcile و موعد بعدی | action | فعال | src/screens/OnboardingScreen.tsx:55 (Button.actionCode) |
| X74 | completeOnboarding | ورود / ادامه بدون اعلان | onboarding_completed و ورود برنامه | action | فعال | src/screens/OnboardingScreen.tsx:69 (Button.actionCode) |
| X75 | retryNotificationResponse | تلاش دوباره برای بازکردن اعلان | coordinator.retry()؛ صف پاسخ اعلان؛ بازخورد و guardهای FIX01/FIX02 محفوظ؛ بدون repair/permission تازه | action | فعال | App.tsx:365 (Button.actionCode) |
| X76 | retryBootstrap | تلاش دوباره برای آماده‌سازی | افزایش attempt و اجرای دوباره راه‌اندازی؛ چرخه خطای اصلاح‌شده FIX02 حفظ شود | action | فعال | App.tsx:407 (Button.actionCode) |
| X77 | reportDay | گزارش روز | mode="day", offset=0 | action | فعال | src/components/ReportRangeControls.tsx:35 (modeCodes.day)؛ src/components/ReportRangeControls.tsx:106 (ReportButton.actionCode) |
| X78 | reportCalendarWeek | هفتهٔ تقویمی | mode="week", offset=0؛ تقویم/شروع هفته | action | فعال | src/components/ReportRangeControls.tsx:36 (modeCodes.week) |
| X79 | reportCalendarMonth | ماه تقویمی | mode="month", offset=0 | action | فعال | src/components/ReportRangeControls.tsx:37 (modeCodes.month) |
| X80 | reportUsageWeek | هفتهٔ استفاده | mode="usage7", offset=0؛ مبنا نخستین استفاده | action | فعال | src/components/ReportRangeControls.tsx:38 (modeCodes.usage7) |
| X81 | reportUsageMonth | دورهٔ ۳۰روزهٔ استفاده | mode="usage30", offset=0 | action | فعال | src/components/ReportRangeControls.tsx:39 (modeCodes.usage30) |
| X82 | reportRollingWeek | ۷ روز اخیر | mode="rolling7", offset=0 | action | فعال | src/components/ReportRangeControls.tsx:40 (modeCodes.rolling7)؛ src/components/ReportRangeControls.tsx:124 (ReportButton.actionCode) |
| X83 | reportRollingMonth | ۳۰ روز اخیر | mode="rolling30", offset=0 | action | فعال | src/components/ReportRangeControls.tsx:41 (modeCodes.rolling30)؛ src/components/ReportRangeControls.tsx:133 (ReportButton.actionCode) |
| X84 | reportCustomRange | بازهٔ دلخواه | mode="custom", offset=0؛ ورودی‌های موجود | action | فعال | src/components/ReportRangeControls.tsx:42 (modeCodes.custom) |
| X85 | previousReportPeriod | روز / دورهٔ قبل | کاهش نسبی offset در mode جاری | action | فعال | src/components/ReportRangeControls.tsx:234 (ReportButton.actionCode) |
| X86 | currentReportPeriod | امروز / دورهٔ جاری | offset=0؛ mode تغییر نمی‌کند | action | فعال | src/components/ReportRangeControls.tsx:242 (ReportButton.actionCode) |
| X87 | nextReportPeriod | دورهٔ بعد | افزایش offset؛ شرط disabled موجود | action | فعال | src/components/ReportRangeControls.tsx:248 (ReportButton.actionCode) |
| X88 | toggleReportCalendar | تغییر تقویم گزارش | شمسی/میلادی و ذخیره ترجیح موجود | action | فعال | src/components/ReportRangeControls.tsx:263 (ReportButton.actionCode) |
| X89 | changeReportWeekStart | تغییر شروع هفته | چرخش روز شروع هفته و ذخیره ترجیح | action | فعال | src/components/ReportRangeControls.tsx:275 (ReportButton.actionCode) |
| X90 | applyCustomReportDates | نمایش بازهٔ دلخواه | دو تاریخ draft به query و خواندن گزارش | action | فعال | src/components/ReportRangeControls.tsx:325 (ReportButton.actionCode) |
| X91 | retryReportRead | تلاش دوباره برای دادهٔ گزارش | افزایش refresh و خواندن گزارش | action | فعال | src/screens/InsightsScreen.tsx:160 (ReportButton.actionCode) |
| X92 | retryReportPreferences | تلاش دوباره برای ترجیحات گزارش | loadPreferences | action | فعال | src/screens/InsightsScreen.tsx:161 (ReportButton.actionCode) |
| X93 | editActivityName | نام فعالیت | draft نام | action | فعال | src/components/ActivityEditor.tsx:155 (Input.actionCode) |
| X94 | editIconSearch | جست‌وجو / ورود آیکون | تغییر جست‌وجو/متن آیکون؛ انتخاب با X27 | action | فعال | src/components/ActivityEditor.tsx:224 (Input.actionCode) |
| X95 | searchClassification | جست‌وجوی دسته | فیلتر دسته‌ها؛ Deferred/Reserved | action | رزرو | — |
| X96 | editConfirmedTimezone | منطقهٔ زمانی تأییدشده | draft منطقه؛ commit با X50 | action | فعال | src/screens/CheckInScreen.tsx:239 (Input.actionCode) |
| X97 | editCustomReportStart | تاریخ شروع گزارش دلخواه | draft شروع | action | فعال | src/components/ReportRangeControls.tsx:298 (Input.actionCode) |
| X98 | editCustomReportEnd | تاریخ پایان گزارش دلخواه | draft پایان | action | فعال | src/components/ReportRangeControls.tsx:314 (Input.actionCode) |
| X99 | openMoreReports | بازکردن بیشتر گزارش | فقط بازکردن D08؛ بدون query/write/navigation تازه | action | فعال | src/screens/InsightsScreen.tsx:229 (ReportButton.actionCode)؛ src/components/ReportRangeControls.tsx:142 (ReportButton.actionCode) |
| X100 | showPreviousCalendarDay | روز قبل مطلق | mode=day, offset=-1؛ متفاوت از حرکت نسبی X85 | action | فعال | src/components/ReportRangeControls.tsx:115 (ReportButton.actionCode) |
| X101 | expandAllResultActivities | مشاهده همه | گسترش inline همه r.activities همان query/result؛ بدون صفحه یا محاسبه تازه | action | فعال | src/components/ReportActivitySummary.tsx:123 (ReportButton.actionCode) |
| X102 | openActivitiesFromEmptyCheckIn | افزودن یا بازگرداندن فعالیت | navigate("Main", {screen:"Activities"})؛ خودش فعالیت ایجاد یا restore نمی‌کند، بلکه کاربر را به صفحهٔ فعالیت‌ها می‌برد. | action | فعال | src/screens/CheckInScreen.tsx:299 (Button.actionCode) |

کدهای رزرو badge فعال ندارند؛ وجود آن‌ها قابلیت تازه‌ای ایجاد نمی‌کند. کد بازنشسته دوباره تخصیص داده نمی‌شود و با نام/اثر قبلی در registry باقی می‌ماند. مرجع این نسخه کد بازنشسته‌ای اعلام نکرده است. تاریخچهٔ تخصیص Rev01 و الحاقیه در rc3-id01/allocations-Rev01.json و allocations-Rev02.json حفظ می‌شود؛ generator راهنما این تاریخچه را بازنویسی نمی‌کند.

رابط قابل‌دسترسی ICATUS در RC3-ICATUS-HIDE-01 حذف شده است؛ داده‌ها و سیاست سرویس حفظ شده‌اند. D03/X32…X37/X41/X48/X95 رزرو و بدون محل استفادهٔ فعال‌اند. D08/X99/X100/X101 در M-01/M-04 فعال و در UI پیاده شده‌اند. شواهد پنهان‌سازی و پوشش جاری در گزارش پنهان‌سازی و rc3-icatus-hide01 محفوظ‌اند؛ پوشش جاری در rc3-ui-report01 ثبت است؛ پذیرش گوشی جدا و باز است.
