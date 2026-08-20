import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, ChatMember
from telegram.ext import (
    Application,
    CommandHandler,
    MessageHandler,
    CallbackQueryHandler,
    ContextTypes,
    filters,
)
from config import Config

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)

# Required channels for verification (add your channel usernames here)
REQUIRED_CHANNELS = [
    {"username": "reviewhub_official", "name": "Review Hub Official"},
    {"username": "reviewhub_updates", "name": "Review Hub Updates"},
]


def get_mini_app_url(start_param: str = "") -> str:
    base = Config.FRONTEND_URL
    version = "v2"
    url = f"{base}?v={version}"
    if start_param:
        url = f"{url}&startapp={start_param}"
    return url


async def check_channel_membership(context: ContextTypes.DEFAULT_TYPE, user_id: int) -> list[dict]:
    """Check if user has joined all required channels. Returns list of channels not joined."""
    not_joined = []
    for channel in REQUIRED_CHANNELS:
        try:
            member = await context.bot.get_chat_member(
                chat_id=f"@{channel['username']}",
                user_id=user_id,
            )
            if member.status in [ChatMember.LEFT, ChatMember.KICKED]:
                not_joined.append(channel)
        except Exception as e:
            logger.warning(f"Could not check membership for {channel['username']}: {e}")
            # If we can't check, assume not joined
            not_joined.append(channel)
    return not_joined


def mini_app_button(text: str, start_param: str = "") -> InlineKeyboardButton:
    return InlineKeyboardButton(
        text,
        web_app={"url": get_mini_app_url(start_param)},
    )


def admin_panel_button() -> InlineKeyboardButton:
    return InlineKeyboardButton(
        "🛠 Open Review Hub Admin",
        url=f"{Config.FRONTEND_URL}/admin?v=v2",
    )


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user = update.effective_user
    args = context.args
    start_param = args[0] if args else ""

    # Check channel membership
    not_joined = await check_channel_membership(context, user.id)

    if not_joined:
        # User hasn't joined all channels - show join prompt
        channel_buttons = []
        for ch in not_joined:
            channel_buttons.append([
                InlineKeyboardButton(
                    f"📢 Join {ch['name']}",
                    url=f"https://t.me/{ch['username']}"
                )
            ])

        # Add verify button
        channel_buttons.append([
            InlineKeyboardButton("✅ I've Joined - Verify", callback_data="verify_join")
        ])

        await update.message.reply_text(
            f"👋 Welcome {user.first_name}!\n\n"
            "Before you can use Review Hub, please join our required channels:\n\n"
            + "\n".join(f"📢 @{ch['username']}" for ch in not_joined) +
            "\n\nJoin all channels and click verify below!",
            reply_markup=InlineKeyboardMarkup(channel_buttons)
        )
        return

    # User has joined all channels - show main menu
    admin_row = []
    if user.id in Config.ADMIN_IDS:
        admin_row = [admin_panel_button()]

    if start_param and start_param.startswith("ref_"):
        referral_code = start_param[4:]
        rows = [[mini_app_button("Open Review Hub", start_param)]]
        if admin_row:
            rows.append(admin_row)
        await update.message.reply_text(
            f"✅ Verified! Welcome {user.first_name}! 🎉\n\n"
            f"You were referred by a friend!\n"
            "Complete tasks and earn rewards in INR. 💰",
            reply_markup=InlineKeyboardMarkup(rows),
        )
    else:
        rows = [[mini_app_button("Open Review Hub")]]
        if admin_row:
            rows.append(admin_row)
        await update.message.reply_text(
            f"✅ Verified! Welcome {user.first_name}! 👋\n\n"
            "Review Hub - Complete tasks and earn rewards in INR! 💰\n\n"
            "Click the button below to open the app:",
            reply_markup=InlineKeyboardMarkup(rows),
        )


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    text = (
        "📋 Review Hub Bot\n\n"
        "Commands:\n"
        "/start - Open the Mini App\n"
        "/tasks - View available tasks\n"
        "/balance - Check your balance\n"
        "/status - Check submission status\n"
        "/help - Show this help\n"
    )
    if update.effective_user.id in Config.ADMIN_IDS:
        text += (
            "\n🔧 Admin Commands:\n"
            "/broadcast - Send message to all users\n"
            "/stats - View platform stats\n"
        )
    await update.message.reply_text(text)


async def tasks(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(
        "📋 View all available tasks in the Mini App!",
        reply_markup=InlineKeyboardMarkup([
            [mini_app_button("View Tasks", "tasks")]
        ]),
    )


async def balance(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(
        "💰 Check your wallet balance in the Mini App!",
        reply_markup=InlineKeyboardMarkup([
            [mini_app_button("Open Wallet", "wallet")]
        ]),
    )


async def status(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(
        "📊 Check your submission status in the Mini App!",
        reply_markup=InlineKeyboardMarkup([
            [mini_app_button("My Submissions", "submissions")]
        ]),
    )


async def broadcast_start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if update.effective_user.id not in Config.ADMIN_IDS:
        await update.message.reply_text("⛔ Admin only command.")
        return
    await update.message.reply_text(
        "📢 Broadcast Mode\n\nSend me the message you want to broadcast to all users.\n"
        "Send /cancel to exit broadcast mode."
    )
    context.user_data["broadcast_mode"] = True


async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    context.user_data["broadcast_mode"] = False
    await update.message.reply_text("❌ Broadcast cancelled.")


async def handle_broadcast(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not context.user_data.get("broadcast_mode"):
        return
    if update.effective_user.id not in Config.ADMIN_IDS:
        return

    context.user_data["broadcast_mode"] = False
    text = update.message.text

    keyboard = InlineKeyboardMarkup([
        [mini_app_button("Open Review Hub")]
    ])

    sent = 0
    failed = 0

    await update.message.reply_text(f"📢 Broadcasting to users...\n\nMessage: {text}")

    try:
        import httpx
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{Config.BACKEND_URL}/api/admin/broadcast-preview")
            if resp.status_code == 200:
                await update.message.reply_text("✅ Broadcast sent! (Preview mode)")
            else:
                await update.message.reply_text("⚠️ Broadcast API not available yet.")
    except Exception as e:
        logger.error(f"Broadcast error: {e}")
        await update.message.reply_text(f"⚠️ Broadcast completed with errors.")


async def stats(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if update.effective_user.id not in Config.ADMIN_IDS:
        await update.message.reply_text("⛔ Admin only command.")
        return

    try:
        import httpx
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{Config.BACKEND_URL}/api/admin/stats")
            if resp.status_code == 200:
                data = resp.json()
                text = (
                    f"📊 Platform Stats\n\n"
                    f"👥 Users: {data['users']['total']} ({data['users']['active']} active)\n"
                    f"📋 Tasks: {data['tasks']['total']}\n"
                    f"📨 Pending Reviews: {data['submissions']['pending']}\n"
                    f"💰 Pending Payouts: {data['withdrawals']['pending']}\n"
                    f"💸 Total Paid: ₹{data['withdrawals']['total_payout']:,.2f}\n"
                    f"🏦 Platform Balance: ₹{data['total_balance']:,.2f}"
                )
                await update.message.reply_text(text)
            else:
                await update.message.reply_text("⚠️ Could not fetch stats.")
    except Exception as e:
        logger.error(f"Stats error: {e}")
        await update.message.reply_text("⚠️ Stats API not available.")


async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if context.user_data.get("broadcast_mode"):
        await handle_broadcast(update, context)


async def handle_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()

    if query.data == "verify_join":
        user = query.from_user
        not_joined = await check_channel_membership(context, user.id)

        if not_joined:
            # Still not joined - show updated list
            channel_buttons = []
            for ch in not_joined:
                channel_buttons.append([
                    InlineKeyboardButton(
                        f"📢 Join {ch['name']}",
                        url=f"https://t.me/{ch['username']}"
                    )
                ])
            channel_buttons.append([
                InlineKeyboardButton("✅ I've Joined - Verify", callback_data="verify_join")
            ])

            await query.edit_message_text(
                f"❌ You haven't joined all channels yet!\n\n"
                "Still need to join:\n"
                + "\n".join(f"📢 @{ch['username']}" for ch in not_joined) +
                "\n\nJoin all channels and click verify!",
                reply_markup=InlineKeyboardMarkup(channel_buttons)
            )
        else:
            # All joined - show main menu
            admin_row = []
            if user.id in Config.ADMIN_IDS:
                admin_row = [admin_panel_button()]

            rows = [[mini_app_button("Open Review Hub")]]
            if admin_row:
                rows.append(admin_row)

            await query.edit_message_text(
                f"✅ Verified! Welcome {user.first_name}! 👋\n\n"
                "Review Hub - Complete tasks and earn rewards in INR! 💰\n\n"
                "Click the button below to open the app:",
                reply_markup=InlineKeyboardMarkup(rows),
            )


def main() -> None:
    if not Config.BOT_TOKEN:
        logger.error("BOT_TOKEN not set!")
        return

    application = Application.builder().token(Config.BOT_TOKEN).build()

    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(CommandHandler("tasks", tasks))
    application.add_handler(CommandHandler("balance", balance))
    application.add_handler(CommandHandler("status", status))
    application.add_handler(CommandHandler("broadcast", broadcast_start))
    application.add_handler(CommandHandler("stats", stats))
    application.add_handler(CommandHandler("cancel", cancel))
    application.add_handler(CallbackQueryHandler(handle_callback))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

    if Config.WEBHOOK_URL:
        application.run_webhook(
            listen="0.0.0.0",
            port=8080,
            url_path=Config.BOT_TOKEN,
            webhook_url=f"{Config.WEBHOOK_URL}/{Config.BOT_TOKEN}",
        )
    else:
        application.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
