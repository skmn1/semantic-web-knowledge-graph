# Troubleshooting Guide

## Common Issues and Solutions

### Server Won't Start

**Problem**: `npm run dev` fails or shows errors

**Solutions**:
1. Check if port 3000 is already in use:
   ```bash
   lsof -i :3000
   # Kill the process if needed
   kill -9 <PID>
   ```

2. Delete node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. Check Node.js version:
   ```bash
   node --version  # Should be 16+
   ```

### Browser Shows Blank Page

**Problem**: Application loads but shows nothing

**Solutions**:
1. Check browser console for errors (F12)
2. Verify server is running at http://localhost:3000
3. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
4. Clear browser cache and reload

### SPARQL Queries Not Working

**Problem**: Queries return no results or show errors

**Solutions**:
1. Check query syntax - PREFIX declarations must be at top
2. Verify namespace prefixes match:
   - `ex:` → `http://example.org/photos/`
   - `dc:` → `http://purl.org/dc/elements/1.1/`
3. Use example queries as templates
4. Check that resource IDs exist (photo1-photo5)

**Example working query**:
```sparql
PREFIX ex: <http://example.org/photos/>
PREFIX dc: <http://purl.org/dc/elements/1.1/>

SELECT ?photo ?title
WHERE {
  ?photo dc:title ?title .
}
```

### Access Requests Not Showing

**Problem**: Submitted access requests don't appear

**Solutions**:
1. Switch to the resource owner's account
2. Check "My Resources" page → "Access Requests" section
3. Verify you're not requesting access to your own photos
4. Refresh the page to update state

### Policies Not Working as Expected

**Problem**: Access granted/denied unexpectedly

**Solutions**:
1. Use the Policy Tester to debug
2. Remember: Both UMA AND ODRL must approve
3. Check if user has UMA permission first
4. Then check ODRL policy for the specific action
5. Verify constraints (purpose, time limits)

**Decision Flow**:
```
UMA Permission? 
  No → Denied (request access first)
  Yes → Check ODRL
    Prohibited? → Denied
    Permitted with constraints met? → Allowed
    Otherwise → Denied
```

### User Switching Issues

**Problem**: User doesn't change when clicking Switch User

**Solutions**:
1. Click on a different user in the modal
2. Close modal and check top-right user badge
3. Refresh page if state seems stuck
4. Check browser console for errors

### Audit Log Not Showing Queries

**Problem**: Queries executed but not appearing in log

**Solutions**:
1. Make sure you're executing queries in SPARQL Playground
2. Queries must complete successfully to be logged
3. Check filters - you might be filtering out your queries
4. Switch to "All Users" and "All Resources" in filters

### Images Not Loading

**Problem**: Photo thumbnails don't show

**Solutions**:
1. Images use Unsplash URLs - check internet connection
2. Some images may be restricted by content blockers
3. Photos without access show blurred placeholder - this is intentional
4. Check browser console for network errors

### Build Errors

**Problem**: `npm run build` fails

**Solutions**:
1. Check all imports are correct
2. Verify no syntax errors in JSX files
3. Run `npm run dev` first to catch errors
4. Check Vite output for specific error messages

## Debug Mode

### Enable Detailed Logging

Add to your browser console to see debug info:

```javascript
// Log all SPARQL queries
localStorage.setItem('debug_sparql', 'true');

// Log all policy checks
localStorage.setItem('debug_odrl', 'true');

// Log all UMA decisions
localStorage.setItem('debug_uma', 'true');
```

### Inspect Data

Open browser console and run:

```javascript
// Check RDF store
import rdfStore from './src/services/rdfStore.js';
console.log(rdfStore.getStore().size); // Number of triples

// Check policies
import odrlManager from './src/services/odrlManager.js';
console.log(odrlManager.getAllPolicies());

// Check permissions
import umaAccessControl from './src/services/umaAccessControl.js';
console.log(umaAccessControl.getPermissionsForUser('bob'));
```

## Performance Issues

### Slow Query Execution

**Solutions**:
1. Current dataset is small - should be <50ms
2. Complex queries with many FILTERs may take longer
3. Check execution time in SPARQL Playground
4. For production, use dedicated triple store

### UI Feels Sluggish

**Solutions**:
1. Clear browser cache
2. Disable browser extensions
3. Check if dev tools are open (slows rendering)
4. Build for production and use `npm run preview`

## Data Issues

### Photos Not Showing Correct Data

**Problem**: Metadata looks wrong or missing

**Solutions**:
1. Data is initialized in `src/services/rdfStore.js`
2. Check `initializeSampleData()` method
3. Verify SPARQL queries match the RDF structure
4. Use SPARQL Playground to query raw data

### Want to Add More Photos?

Edit `src/services/rdfStore.js`:

```javascript
// Add to initializeSampleData() method
const photo6 = uri('ex', 'photo6');
this.addTriple(photo6, uri('rdf', 'type'), uri('ex', 'ResearchPhoto'));
this.addTriple(photo6, uri('dc', 'title'), literal('Your Title'));
// ... add more triples
```

Don't forget to:
1. Add ODRL policy in `src/services/odrlManager.js`
2. Add resource ownership in `src/services/umaAccessControl.js`
3. Add image URL in `src/pages/BrowsePhotos.jsx`

## Browser Compatibility

### Tested Browsers
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Not Supported
- ❌ Internet Explorer (use Edge)
- ❌ Very old browser versions

## Development Tools

### Useful Browser Extensions

1. **React Developer Tools**
   - Inspect component state
   - Debug React rendering

2. **JSON Viewer**
   - Format ODRL policies
   - View RDF data structures

3. **Network Monitor**
   - Check if external images load
   - Debug API calls (if added)

## Getting Help

### Check These First
1. Browser console (F12) for JavaScript errors
2. Network tab for failed requests
3. React DevTools for component state
4. Terminal output for server errors

### Documentation
1. README.md - Complete overview
2. QUICKSTART.md - Getting started
3. ARCHITECTURE.md - System design
4. PROJECT_SUMMARY.md - What was built

### Code Comments
Every service file has detailed comments explaining:
- What the code does
- Why design decisions were made
- How to extend functionality

## Reset to Default State

### Clear All User Data

Currently, all data is in-memory and resets on page refresh:
- Access requests
- Permissions
- Query logs
- User sessions

**To reset**: Simply refresh the browser page (F5)

### Reinstall from Scratch

```bash
cd /home/kamnis/semanticWeb
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## Known Limitations

These are intentional design decisions for educational purposes:

1. **In-Memory Storage**
   - Data doesn't persist between sessions
   - Resets on server restart
   - *Production would use database*

2. **Mock Authentication**
   - Simple user switching
   - No real login system
   - *Production would use OAuth/JWT*

3. **Simplified SPARQL**
   - Subset of SPARQL 1.1
   - No CONSTRUCT, ASK, DESCRIBE
   - No named graphs
   - *Production could use full SPARQL endpoint*

4. **Basic OWL Reasoning**
   - Simple property hierarchies
   - No full reasoner
   - *Production could use OWL-RL reasoner*

5. **Client-Side Only**
   - All logic in browser
   - No backend server
   - *Production needs server-side validation*

These limitations are documented and don't affect the educational value!

## Still Having Issues?

1. **Check the code**: All source is commented and readable
2. **Review examples**: Working examples in every component
3. **Read docs**: Comprehensive documentation provided
4. **Inspect state**: Use React DevTools to see component state
5. **Console logging**: Add `console.log()` to debug

## Success Indicators

Your app is working correctly if:

✅ Server starts without errors  
✅ Browse page shows 5 photos  
✅ SPARQL queries return results  
✅ User switching changes the displayed name  
✅ Access requests can be created  
✅ Policies show permissions and prohibitions  
✅ Audit log shows query history  
✅ No errors in browser console  

If all these work, you're good to go! 🎉

---

**Remember**: This is an educational project designed to demonstrate concepts. Any "limitations" are intentional and don't prevent learning the Semantic Web technologies!
