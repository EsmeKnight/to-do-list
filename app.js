
import express from "express";
import bodyParser from "body-parser";
import date from "./date.js";
import mongoose from "mongoose";
import _ from "lodash";
import "dotenv/config";

const server = process.env.N1_KEY;
const serverCred = process.env.N1_SECRET;
const mongoDB = `mongodb+srv://${server}:${serverCred}@todolistcluster.rurag.mongodb.net/todolistDB?retryWrites=true&w=majority`

const app = express();
const currentDate = date.date;
const day = date.day;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");


main().catch(err => console.log(err));

async function main() {
    await mongoose.connect(mongoDB);

    const itemsSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true
        }
    });
    const Item = mongoose.model("Item", itemsSchema);

    // Default items, if DB empty- populates with these
    const item1 = new Item(
        { name: "Brush teeth" }
    );
    const item2 = new Item(
        { name: "Make tea" }
    );
    const item3 = new Item(
        { name: "Turn on computer" }
    );
    const defaultItems = [item1, item2, item3];

    const listSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true
        },
        items: [itemsSchema]
    });
    const List = mongoose.model("List", listSchema);


    app.get("/", (req, res) => {
        Item.find({}, function (err, foundItems) {
            if (foundItems.length === 0) {
                Item.insertMany(defaultItems, function (error) {
                    if (!error) {
                        console.log("Successfully saved default items to DB");
                    }
                });
                res.redirect("/");
            } else {
                res.render("list", { listTitle: currentDate, newListItems: foundItems });
            }
        })
    });

    let customListName;
    app.get("/:customListName", function (req, res) {
        customListName = _.capitalize(req.params.customListName);
        List.findOne({ name: customListName }, function (err, foundList) {
            if (!err) {
                if (!foundList) {
                    // create new list
                    const list = new List({
                        name: customListName,
                        items: defaultItems,
                    });
                    list.save()
                    res.redirect(`/${customListName}`)
                } else {
                    // show existing list
                    res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
                }
            } else {
                console.log("Something went wrong");
            }
        })
    });

    app.post("/", function (req, res) {
        const itemName = req.body.newItem;
        const listName = req.body.list
        const item = new Item(
            { name: itemName }
        );
        if (listName === currentDate) {
            item.save()
            res.redirect("/")
        } else {
            List.findOne({ name: customListName }, function (err, foundList) {
                foundList.items.push(item);
                foundList.save();
                res.redirect(`/${customListName}`)
            })
        }
    });

    app.post("/delete", function (req, res) {
        const checkedItemID = req.body.checkbox;
        const listName = req.body.listName;
        if (listName === currentDate) {
            Item.findByIdAndRemove(checkedItemID, function (err) {
                if (!err) {
                    console.log("Successfully deleted item")
                    res.redirect("/")
                }
            })
        } else {
            List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemID } } }, function (err, foundList) {
                if (!err) {
                    res.redirect(`/${listName}`)
                }
            })
        }

    });
    // await Item.deleteOne({ name: "test" });

    app.get("/work", function (req, res) {
        res.render("list", { listTitle: "Work List", newListItems: workItems });

    });

    app.get("/about", function (req, res) {
        res.render("about");
    });

    let port = process.env.PORT;
    if (port == null || port == "") {
        port = 3000;
    }

    app.listen(port, function () {
        console.log(`Your server is running on ${port}`);
    });
}