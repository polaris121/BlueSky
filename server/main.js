import { Meteor } from 'meteor/meteor';
import { LinksCollection } from '/imports/api/links';
import { MatricesCollection } from '/imports/api/matrices';
import { UsersCollection } from '/imports/api/users';
import { SettingsCollection } from '/imports/api/settings';

// Create a settings collection for app configuration

async function insertLink({ title, url }) {
  await LinksCollection.insertAsync({ title, url, createdAt: new Date() });
}

Meteor.startup(async () => {
  // If the Links collection is empty, add some data.
  if (await LinksCollection.find().countAsync() === 0) {
    await insertLink({
      title: 'Do the Tutorial',
      url: 'https://www.meteor.com/tutorials/react/creating-an-app',
    });

    await insertLink({
      title: 'Follow the Guide',
      url: 'https://guide.meteor.com',
    });

    await insertLink({
      title: 'Read the Docs',
      url: 'https://docs.meteor.com',
    });

    await insertLink({
      title: 'Discussions',
      url: 'https://forums.meteor.com',
    });
  }

  // Initialize default admin user if users collection is empty
  if (await UsersCollection.find().countAsync() === 0) {
    await UsersCollection.insertAsync({
      username: 'admin',
      password: 'admin123', // In production, this should be hashed
      role: 'Admin',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    });
  }

  // Initialize default cost per cell setting
  if (await SettingsCollection.find({ key: 'costPerCell' }).countAsync() === 0) {
    await SettingsCollection.insertAsync({
      key: 'costPerCell',
      value: 4,
      updatedAt: new Date(),
      updatedBy: 'system'
    });
  }

  // We publish the entire Links collection to all clients.
  // In order to be fetched in real-time to the clients
  Meteor.publish("links", function () {
    return LinksCollection.find();
  });

  // Publish matrices
  Meteor.publish("matrices", function () {
    return MatricesCollection.find();
  });

  // Publish users
  Meteor.publish("users", function () {
    return UsersCollection.find();
  });

  Meteor.publish("settings", function () {
    return SettingsCollection.find();
  });
});

// Meteor methods for matrix operations
Meteor.methods({
  async 'matrices.insert'(matrixData) {
    // Insert a new matrix
    return await MatricesCollection.insertAsync({
      name: matrixData.name || 'Matrix',
      dimensions: matrixData.dimensions,
      data: matrixData.data,
      selections: matrixData.selections,
      columnHeaders: matrixData.columnHeaders || [],
      rowHeaders: matrixData.rowHeaders || [],
      createdBy: matrixData.createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    });
  },

  async 'matrices.updateSelection'(matrixId, rowIndex, colIndex, username) {
    // Update a cell selection
    const matrix = await MatricesCollection.findOneAsync(matrixId);
    if (!matrix) {
      throw new Meteor.Error('Matrix not found');
    }

    const updatedSelections = [...matrix.selections];
    const currentSelections = updatedSelections[rowIndex][colIndex];
    
    // Check if user has already selected this cell
    const userAlreadySelected = currentSelections.includes(username);
    
    if (userAlreadySelected) {
      // User wants to unselect - remove their selection
      updatedSelections[rowIndex][colIndex] = currentSelections.filter(user => user !== username);
      
      await MatricesCollection.updateAsync(matrixId, {
        $set: {
          selections: updatedSelections,
          updatedAt: new Date()
        }
      });
    } else {
      // User wants to select - check if cell has space (max 5 selections)
      if (currentSelections.length < 5) {
        updatedSelections[rowIndex][colIndex] = [...currentSelections, username];
        
        await MatricesCollection.updateAsync(matrixId, {
          $set: {
            selections: updatedSelections,
            updatedAt: new Date()
          }
        });
      } else {
        throw new Meteor.Error('Cell is full');
      }
    }
  },

  async 'matrices.setActive'(matrixId) {
    // Set a matrix as the active one (deactivate others)
    await MatricesCollection.updateAsync({}, {
      $set: { isActive: false }
    }, { multi: true });

    await MatricesCollection.updateAsync(matrixId, {
      $set: { isActive: true, updatedAt: new Date() }
    });
  },

  async 'matrices.updateHeaders'(columnHeaders, rowHeaders) {
    // Update headers of the currently active matrix
    const activeMatrix = await MatricesCollection.findOneAsync({ isActive: true });
    if (!activeMatrix) {
      throw new Meteor.Error('No active matrix found. Please create a matrix first.');
    }

    await MatricesCollection.updateAsync(activeMatrix._id, {
      $set: { 
        columnHeaders: columnHeaders,
        rowHeaders: rowHeaders,
        updatedAt: new Date() 
      }
    });

    return activeMatrix._id;
  },

  // User management methods
  async 'users.insert'(userData) {
    // Check if username already exists
    const existingUser = await UsersCollection.findOneAsync({ username: userData.username });
    if (existingUser) {
      throw new Meteor.Error('Username already exists');
    }

    // Insert new user
    return await UsersCollection.insertAsync({
      username: userData.username,
      password: userData.password, // In production, hash this password
      role: userData.role || 'User',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    });
  },

  async 'users.remove'(username) {
    // Remove user by username
    const result = await UsersCollection.removeAsync({ username: username });
    if (result === 0) {
      throw new Meteor.Error('User not found');
    }
    return result;
  },

  async 'users.authenticate'(username, password) {
    // Find user with matching credentials
    const user = await UsersCollection.findOneAsync({ 
      username: username, 
      password: password,
      isActive: true 
    });
    
    if (!user) {
      throw new Meteor.Error('Invalid credentials');
    }
    
    return {
      _id: user._id,
      username: user.username,
      role: user.role
    };
  },

  async 'admin.updateCostPerCell'(newCost) {
    // Validate that the cost is a positive number
    if (typeof newCost !== 'number' || newCost < 0) {
      throw new Meteor.Error('Invalid cost value');
    }

    // Update or insert the cost per cell setting
    const result = await SettingsCollection.upsertAsync(
      { key: 'costPerCell' },
      {
        $set: {
          value: newCost,
          updatedAt: new Date(),
          updatedBy: 'admin'
        }
      }
    );

    return result;
  },

  async 'users.updatePassword'(username, newPassword) {
    // Validate inputs
    if (!username || !newPassword) {
      throw new Meteor.Error('Username and password are required');
    }
    
    if (newPassword.length < 4) {
      throw new Meteor.Error('Password must be at least 4 characters long');
    }
    
    // Find the user
    const user = await UsersCollection.findOneAsync({ username: username });
    if (!user) {
      throw new Meteor.Error('User not found');
    }
    
    // Update the password
    const result = await UsersCollection.updateAsync(
      { username: username },
      {
        $set: {
          password: newPassword,
          updatedAt: new Date()
        }
      }
    );
    
    return result;
  },

  async 'users.updateEmail'(username, newEmail) {
    // Validate inputs
    if (!username || !newEmail) {
      throw new Meteor.Error('Username and email are required');
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      throw new Meteor.Error('Invalid email format');
    }
    
    // Find the user
    const user = await UsersCollection.findOneAsync({ username: username });
    if (!user) {
      throw new Meteor.Error('User not found');
    }
    
    // Check if email is already in use by another user
    const existingUser = await UsersCollection.findOneAsync({ 
      email: newEmail, 
      username: { $ne: username } 
    });
    if (existingUser) {
      throw new Meteor.Error('Email is already in use by another user');
    }
    
    // Update the email
    const result = await UsersCollection.updateAsync(
      { username: username },
      {
        $set: {
          email: newEmail,
          updatedAt: new Date()
        }
      }
    );
    
    return result;
  }
});
