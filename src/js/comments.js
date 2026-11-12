// Blog comments: lists approved comments and posts new ones for approval.
(function () {
  var root = document.getElementById("comments");
  if (!root) return;
  var post = root.getAttribute("data-post");
  var list = root.querySelector(".comment-list");
  var count = root.querySelector(".comment-count");
  var form = root.querySelector("form");
  var status = root.querySelector(".comment-status");

  var dateFmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" });

  function render(comments) {
    list.textContent = "";
    count.textContent = comments.length ? "(" + comments.length + ")" : "";
    if (!comments.length) {
      var empty = document.createElement("p");
      empty.className = "muted";
      empty.textContent = "No comments yet. Be the first.";
      list.appendChild(empty);
      return;
    }
    comments.forEach(function (c) {
      var item = document.createElement("article");
      item.className = "comment";
      var head = document.createElement("p");
      head.className = "comment-head";
      var name = document.createElement("strong");
      name.textContent = c.name;
      var when = document.createElement("time");
      when.dateTime = c.created_at;
      when.textContent = dateFmt.format(new Date(c.created_at));
      head.appendChild(name);
      head.appendChild(when);
      item.appendChild(head);
      c.body.split(/\n{2,}/).forEach(function (para) {
        var p = document.createElement("p");
        para.split("\n").forEach(function (line, i) {
          if (i) p.appendChild(document.createElement("br"));
          p.appendChild(document.createTextNode(line));
        });
        item.appendChild(p);
      });
      list.appendChild(item);
    });
  }

  function load() {
    fetch("/api/comments?post=" + encodeURIComponent(post))
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r); })
      .then(function (d) { render(d.comments || []); })
      .catch(function () {
        list.textContent = "";
        var p = document.createElement("p");
        p.className = "muted";
        p.textContent = "Comments couldn't be loaded right now.";
        list.appendChild(p);
      });
  }

  function say(text, kind) {
    status.textContent = text;
    status.className = "comment-status" + (kind ? " " + kind : "");
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var fd = new FormData(form);
      var token = fd.get("cf-turnstile-response");
      if (!token) { say("Please wait a moment for the robot check to finish, then try again.", "error"); return; }
      var button = form.querySelector("button[type=submit]");
      button.disabled = true;
      say("Sending…");
      fetch("/api/comments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ post: post, name: fd.get("name"), body: fd.get("body"), website: fd.get("website"), token: token })
      })
        .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
        .then(function (res) {
          if (res.ok) {
            form.reset();
            say("Thanks! Your comment will show up here once I have approved it.", "ok");
          } else {
            say(res.d.error || "Something went wrong. Please try again.", "error");
          }
        })
        .catch(function () { say("Something went wrong. Please try again.", "error"); })
        .then(function () {
          button.disabled = false;
          if (window.turnstile) window.turnstile.reset();
        });
    });
  }

  load();
})();
