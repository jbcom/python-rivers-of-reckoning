from .map_data import SHOP_ITEMS
import time


def shop_menu(stdscr, player):
    while True:
        stdscr.clear()
        stdscr.addstr(2, 2, "Welcome to the Shop! Spend your gold on gear:")
        stdscr.addstr(3, 2, f"Gold: {player.gold}")
        for idx, item in enumerate(SHOP_ITEMS):
            level = getattr(player, f"{item['effect']}_level", 0)
            owned = f" (level {level})" if item["effect"] != "potion" and level > 0 else ""
            stdscr.addstr(
                5 + idx,
                4,
                f"{idx + 1}. {item['name']} ({item['cost']} gold): {item['desc']}{owned}",
            )
        stdscr.addstr(5 + len(SHOP_ITEMS), 4, "0. Exit shop")
        stdscr.refresh()
        key = stdscr.getch()
        if key == ord("0"):
            break
        for idx, item in enumerate(SHOP_ITEMS):
            if key == ord(str(idx + 1)):
                if player.gold >= item["cost"]:
                    player.gold -= item["cost"]
                    if item["effect"] == "potion":
                        player.heal(3)
                    elif item["effect"] == "sword":
                        player.sword_level += 1
                        stdscr.addstr(
                            5 + len(SHOP_ITEMS) + 2,
                            4,
                            f"Sword upgraded to level {player.sword_level}!",
                        )
                    elif item["effect"] == "shield":
                        player.shield_level += 1
                        stdscr.addstr(
                            5 + len(SHOP_ITEMS) + 2,
                            4,
                            f"Shield upgraded to level {player.shield_level}!",
                        )
                    elif item["effect"] == "boots":
                        player.boots_level += 1
                        stdscr.addstr(
                            5 + len(SHOP_ITEMS) + 2,
                            4,
                            f"Boots upgraded to level {player.boots_level}!",
                        )
                    player.gear.add(item["effect"])
                else:
                    stdscr.addstr(5 + len(SHOP_ITEMS) + 2, 4, "Not enough gold!")
                stdscr.refresh()
                time.sleep(1)
                break
