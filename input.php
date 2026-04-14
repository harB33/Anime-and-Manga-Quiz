<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ACG: Anime Cards Gallery</title>
</head>
<body>
    <h1>ACG: Anime Cards Gallery</h1>
    <form action="output.php" method="post">
        <label for="first_name">First Name:</label>
        <input type="text" name="first_name" placeholder="First Name">
        
        <label for="last_name">Last Name:</label>
        <input type="text" name="last_name" placeholder="Last Name">

        <label for="email">Email:</label>
        <input type="email" name="email" placeholder="Email">

        <input type="checkbox" name="items[]" value="card1">
        <label for="card1">Card 1</label>
        <input type="checkbox" name="items[]" value="card2">
        <label for="card2">Card 2</label>
        <input type="checkbox" name="items[]" value="card3">
        <label for="card3">Card 3</label>

        <button type="submit" name="submit">Place Order</button>
    </form>
    
</body>
</html>