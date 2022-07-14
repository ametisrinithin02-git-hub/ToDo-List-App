//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-srinithin:Ameti%407794@cluster0.qce8i.mongodb.net/todolistDB");



const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item" , itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist"
});
const item2 = new Item({
  name: "Hit the + button to add a new item"
});
const item3 = new Item({
  name: "<-- Hit this to delete an item>"
});

const defaultItems = [item1, item2, item3];


app.get("/", function(req, res) {
  Item.find({},function(err,foundItems){
    if(foundItems.length == 0){
        Item.insertMany(defaultItems,function(err){
          if(err) console.log(err);
          else console.log("Successfully Inserted to DB");
        })

        res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    } 
  });
  
});

const listSchema = {
  name:String,
  items: [itemsSchema]
}
const List = mongoose.model("List", listSchema);

app.get("/:customListName",function(req, res){
  var customListName = req.params.customListName;
  customListName = _.capitalize(customListName);
  console.log(customListName);

  List.findOne({name:customListName},function(err, foundList){
    if(!foundList){
      //create a new list
        const list = new List({
          name:customListName,
          items:defaultItems
        })
        list.save();
        // console.log("entered !");
        res.redirect("/" + customListName);
    }
    else{
      //show an existing list
      res.render("list", {listTitle: foundList.name , newListItems: foundList.items})
    }

  })
 
})

app.post("/", function(req, res){

  const item_name = req.body.newItem;
  const listName = req.body.list;
  console.log(item_name);
  console.log(listName);

  const item_obj = new Item({
    name:item_name
  })

  if(listName === "Today"){
    item_obj.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName}, function(err, foundList){
      foundList.items.push(item_obj);
      foundList.save();
      res.redirect("/" + listName);
    })
  }
  
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  // console.log(listName);

  if(listName === "Today"){
    console.log("entered root");
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(!err){
        console.log("successfully deleted");
      }
    })
    res.redirect("/");
  }
  else{
    console.log("entered route inside");
    List.findOneAndUpdate({name:listName }, { $pull: {items :{_id: checkedItemId} }}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName );
      }
    })
  }
});





let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started successfully");
});
